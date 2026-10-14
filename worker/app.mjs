// mmbadges badge service: routing, validation and responses.
// The Worker entry point (with caching) is worker/index.mjs.
//
//   /brand/{slug}.svg?theme=auto|light|dark&style=mono|brand|tint&size=sm|md|lg&label=Text
//   /status/{icon}/{label}/{value}.svg?state=success|warning|danger|info|neutral|auto&theme=…&size=…
//   /github/…, /npm/…, /codecov/…  live badges, see worker/live.mjs
//
// Every response is an SVG, errors included. A README never shows a broken image icon,
// but a readable "badge | not found" instead.

import { renderBrand, STYLES } from '../src/brands.mjs';
import { renderStatus, STATES } from '../src/status.mjs';
import { brandIcon, resolveIcon } from '../src/icons.mjs';
import { THEMES } from '../src/lib.mjs';
import { SIZES } from '../src/sizes.mjs';
import { LIVE_ROOTS, LiveNotFound, UpstreamError, resolveLive } from './live.mjs';

const REPO = 'https://github.com/LukasReckwald/mmbadges';
const MAX_TEXT = 64; // reject longer labels/values so nobody can generate huge SVGs

// Allowed query parameters with default and valid values (null = free text)
const PARAMS = {
  theme: { def: 'auto', values: THEMES },
  size: { def: 'md', values: Object.keys(SIZES) },
  style: { def: 'mono', values: STYLES },
  state: { def: 'neutral', values: STATES },
  label: { def: '', values: null },
  branch: { def: '', values: null }, // live badges only
};

// Cache times: static badges never change, live values are re-fetched every 5 minutes
const CACHE_STATIC = 'public, max-age=86400, s-maxage=604800';
const CACHE_LIVE = 'public, max-age=300';
const CACHE_ERROR = 'public, max-age=300';
const CACHE_UPSTREAM_ERROR = 'public, max-age=60';

class BadgeError extends Error {
  constructor(status, value) {
    super(value);
    this.status = status;
  }
}

// Validate query parameters and fill in defaults
function readParams(searchParams) {
  const p = {};
  for (const [key, { def, values }] of Object.entries(PARAMS)) {
    const v = searchParams.get(key) ?? def;
    if (values && !values.includes(v)) throw new BadgeError(400, `invalid ${key}`);
    if (v.length > MAX_TEXT) throw new BadgeError(400, `${key} too long`);
    p[key] = v;
  }
  return p;
}

// "/brand/react.svg" -> ["brand", "react"]; segments are URL-decoded (%25 -> %)
function segments(pathname) {
  if (!pathname.endsWith('.svg')) return null;
  try {
    return pathname.slice(1, -4).split('/').map(decodeURIComponent);
  } catch {
    throw new BadgeError(400, 'bad url');
  }
}

async function render(url, env) {
  const parts = segments(url.pathname);
  if (!parts) throw new BadgeError(404, 'not found');
  const p = readParams(url.searchParams);
  const [kind, ...rest] = parts;

  if (LIVE_ROOTS.includes(kind)) {
    let live;
    try {
      live = await resolveLive(parts, p, env);
    } catch (err) {
      if (err instanceof LiveNotFound) throw new BadgeError(404, err.message);
      throw err;
    }
    const svg = renderStatus({
      icon: resolveIcon(live.icon),
      label: p.label || live.label,
      value: live.value,
      state: live.state,
      theme: p.theme,
      size: p.size,
    });
    return { svg, live: true };
  }

  if (kind === 'brand' && rest.length === 1) {
    const icon = brandIcon(rest[0]);
    if (!icon) throw new BadgeError(404, 'unknown logo');
    return { svg: renderBrand({ icon, label: p.label || icon.title, theme: p.theme, style: p.style, size: p.size }) };
  }

  if (kind === 'status' && rest.length === 3) {
    const [spec, label, value] = rest;
    if (label.length > MAX_TEXT || value.length > MAX_TEXT) throw new BadgeError(400, 'text too long');
    const icon = resolveIcon(spec);
    if (!icon) throw new BadgeError(404, 'unknown icon');
    return { svg: renderStatus({ icon, label, value, state: p.state, theme: p.theme, size: p.size }) };
  }

  throw new BadgeError(404, 'not found');
}

function errorBadge(message, theme) {
  const t = THEMES.includes(theme) ? theme : 'auto';
  return renderStatus({
    icon: resolveIcon('lucide:circle-alert'),
    label: 'badge',
    value: message,
    state: 'danger',
    theme: t,
  });
}

const svgHeaders = (cache, extra = {}) => ({
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'Cache-Control': cache,
  // SVGs can contain scripts. The CSP blocks everything except our inline <style>
  // in case someone opens the URL directly in a browser.
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
  'X-Content-Type-Options': 'nosniff',
  'Access-Control-Allow-Origin': '*',
  ...extra,
});

/**
 * Identical badges should hit the same cache entry: sort parameters, drop defaults.
 * E.g. "/brand/react.svg" and "/brand/react.svg?theme=auto&size=md" share one entry.
 * With a `version` (the deployment ID), every deploy starts with a fresh cache, so
 * design changes show up immediately instead of after the cache expires.
 * @param {URL} url
 * @param {string} [version]
 * @returns {string}
 */
export function cacheKey(url, version) {
  const key = new URL(url.origin + url.pathname);
  for (const name of Object.keys(PARAMS).sort()) {
    const v = url.searchParams.get(name);
    if (v !== null && v !== PARAMS[name].def) key.searchParams.set(name, v);
  }
  if (version) key.searchParams.set('_v', version);
  return key.toString();
}

/**
 * Build the response for a request (without caching). Live badges are marked with an
 * "X-MM-Live" header and upstream failures with "X-MM-Upstream-Error", so the caching
 * layer in worker/index.mjs can keep the last good value as a fallback.
 * @param {Request} request
 * @param {{ GITHUB_TOKEN?: string }} [env]
 * @returns {Promise<Response>}
 */
export async function handle(request, env = {}) {
  const url = new URL(request.url);
  if (url.pathname === '/') {
    return new Response(`mmbadges – modern minimal badges for Markdown\n\n${REPO}\n`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  const theme = url.searchParams.get('theme');
  try {
    const { svg, live } = await render(url, env);
    return new Response(svg, {
      headers: live ? svgHeaders(CACHE_LIVE, { 'X-MM-Live': '1' }) : svgHeaders(CACHE_STATIC),
    });
  } catch (err) {
    if (err instanceof UpstreamError) {
      return new Response(errorBadge(err.message, theme), {
        status: 502,
        headers: svgHeaders(CACHE_UPSTREAM_ERROR, { 'X-MM-Upstream-Error': '1' }),
      });
    }
    if (!(err instanceof BadgeError)) throw err;
    // cache errors only briefly, e.g. a logo might be added soon
    return new Response(errorBadge(err.message, theme), { status: err.status, headers: svgHeaders(CACHE_ERROR) });
  }
}
