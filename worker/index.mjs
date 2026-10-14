// mmbadges badge service (Cloudflare Worker)
//
//   /brand/{slug}.svg?theme=auto|light|dark&style=mono|brand|tint&size=sm|md|lg&label=Text
//   /status/{icon}/{label}/{value}.svg?state=success|warning|danger|info|neutral|auto&theme=…&size=…
//
// Every response is an SVG, errors included. A README never shows a broken image icon,
// but a readable "badge | not found" instead.

import { renderBrand, STYLES } from '../src/brands.mjs';
import { renderStatus, STATES } from '../src/status.mjs';
import { brandIcon, resolveIcon } from '../src/icons.mjs';
import { THEMES } from '../src/lib.mjs';
import { SIZES } from '../src/sizes.mjs';

const REPO = 'https://github.com/LukasReckwald/mmbadges';
const MAX_TEXT = 64; // reject longer labels/values so nobody can generate huge SVGs

// Allowed query parameters with default and valid values (null = free text)
const PARAMS = {
  theme: { def: 'auto', values: THEMES },
  size: { def: 'md', values: Object.keys(SIZES) },
  style: { def: 'mono', values: STYLES },
  state: { def: 'neutral', values: STATES },
  label: { def: '', values: null },
};

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

function render(url) {
  const parts = segments(url.pathname);
  if (!parts) throw new BadgeError(404, 'not found');
  const p = readParams(url.searchParams);
  const [kind, ...rest] = parts;

  if (kind === 'brand' && rest.length === 1) {
    const icon = brandIcon(rest[0]);
    if (!icon) throw new BadgeError(404, 'unknown logo');
    return renderBrand({ icon, label: p.label || icon.title, theme: p.theme, style: p.style, size: p.size });
  }

  if (kind === 'status' && rest.length === 3) {
    const [spec, label, value] = rest;
    if (label.length > MAX_TEXT || value.length > MAX_TEXT) throw new BadgeError(400, 'text too long');
    const icon = resolveIcon(spec);
    if (!icon) throw new BadgeError(404, 'unknown icon');
    return renderStatus({ icon, label, value, state: p.state, theme: p.theme, size: p.size });
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

const svgHeaders = (cache) => ({
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'Cache-Control': cache,
  // SVGs can contain scripts. The CSP blocks everything except our inline <style>
  // in case someone opens the URL directly in a browser.
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
  'X-Content-Type-Options': 'nosniff',
  'Access-Control-Allow-Origin': '*',
});

/**
 * Identical badges should hit the same cache entry: sort parameters, drop defaults.
 * E.g. "/brand/react.svg" and "/brand/react.svg?theme=auto&size=md" share one entry.
 * @param {URL} url
 * @returns {string}
 */
export function cacheKey(url) {
  const key = new URL(url.origin + url.pathname);
  for (const name of Object.keys(PARAMS).sort()) {
    const v = url.searchParams.get(name);
    if (v !== null && v !== PARAMS[name].def) key.searchParams.set(name, v);
  }
  return key.toString();
}

/**
 * Build the response for a request (without caching).
 * @param {Request} request
 * @returns {Response}
 */
export function handle(request) {
  const url = new URL(request.url);
  if (url.pathname === '/') {
    return new Response(`mmbadges – modern minimal badges for Markdown\n\n${REPO}\n`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  try {
    return new Response(render(url), {
      headers: svgHeaders('public, max-age=86400, s-maxage=604800'),
    });
  } catch (err) {
    if (!(err instanceof BadgeError)) throw err;
    // cache errors only briefly, e.g. a logo might be added soon
    return new Response(errorBadge(err.message, url.searchParams.get('theme')), {
      status: err.status,
      headers: svgHeaders('public, max-age=300'),
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD')
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });

    // Cloudflare edge cache (per data center). Note: the Cache API only works on the
    // custom domain (mmbadges.com), not on *.workers.dev.
    const cache = caches.default;
    const key = new Request(cacheKey(new URL(request.url)));
    const hit = await cache.match(key);
    if (hit) return hit;

    const response = handle(request);
    if (response.ok) ctx.waitUntil(cache.put(key, response.clone()));
    return response;
  },
};
