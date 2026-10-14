// Pure helpers that build badge URLs and copy-paste snippets.
// Defaults are left out so URLs stay short and match the worker's cache key.

/** @typedef {{ theme?: string, style?: string, size?: string, label?: string, state?: string, branch?: string }} BadgeOptions */

const DEFAULTS = { theme: 'auto', style: 'mono', size: 'md', label: '', state: 'neutral', branch: '' };

// encodeURIComponent, but keep ":" and "@" readable ("si:npm", "@scope/name") – both are valid in paths
const segment = (s) => encodeURIComponent(s).replace(/%3A/gi, ':').replace(/%40/g, '@');

function query(opts) {
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULTS).sort()) {
    const v = opts[key];
    if (v !== undefined && v !== DEFAULTS[key]) params.set(key, v);
  }
  const q = params.toString();
  return q ? `?${q}` : '';
}

/**
 * @param {string} base e.g. "https://mmbadges.com"
 * @param {string} slug Simple Icons slug
 * @param {BadgeOptions} [opts]
 * @returns {string}
 */
export const brandUrl = (base, slug, opts = {}) => `${base}/brand/${segment(slug)}.svg${query(opts)}`;

/**
 * @param {string} base
 * @param {{ icon: string, label: string, value: string }} badge e.g. { icon: "si:githubactions", ... }
 * @param {BadgeOptions} [opts]
 * @returns {string}
 */
export const statusUrl = (base, { icon, label, value }, opts = {}) =>
  `${base}/status/${segment(icon)}/${segment(label)}/${segment(value)}.svg${query(opts)}`;

// Live badge types and the path they map to (see worker/live.mjs)
export const LIVE_SOURCES = {
  actions: {
    title: 'Build',
    fields: ['repo', 'workflow', 'branch'],
    path: (f) => ['github', 'actions', ...f.repo, f.workflow],
  },
  stars: { title: 'Stars', fields: ['repo'], path: (f) => ['github', 'stars', ...f.repo] },
  release: { title: 'Release', fields: ['repo'], path: (f) => ['github', 'release', ...f.repo] },
  license: { title: 'License', fields: ['repo'], path: (f) => ['github', 'license', ...f.repo] },
  npm: { title: 'npm version', fields: ['pkg'], path: (f) => ['npm', 'v', ...f.pkg] },
  downloads: {
    title: 'Downloads',
    fields: ['pkg', 'period'],
    path: (f) => ['npm', f.period === 'month' ? 'dm' : 'dw', ...f.pkg],
  },
  codecov: { title: 'Coverage', fields: ['repo', 'branch'], path: (f) => ['codecov', ...f.repo] },
};

/**
 * @param {string} base
 * @param {keyof typeof LIVE_SOURCES} source
 * @param {{ repo?: string, workflow?: string, branch?: string, pkg?: string, period?: string }} fields
 *   repo is "owner/name", pkg may be scoped ("@scope/name")
 * @param {BadgeOptions} [opts]
 * @returns {string}
 */
export function liveUrl(base, source, fields, opts = {}) {
  const f = {
    ...fields,
    repo: (fields.repo ?? '').split('/').map((p) => p.trim()),
    pkg: (fields.pkg ?? '').trim().split('/'),
  };
  const usesBranch = LIVE_SOURCES[source].fields.includes('branch');
  const path = LIVE_SOURCES[source].path(f).map(segment).join('/');
  return `${base}/${path}.svg${query({ ...opts, branch: usesBranch ? (fields.branch ?? '').trim() : '' })}`;
}

const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escMd = (s) => s.replace(/[[\]\\]/g, '\\$&');

/**
 * Snippet for a badge.
 * - "markdown": one image, colors follow the system theme (theme=auto)
 * - "html": <picture> with fixed light/dark URLs, follows the GitHub theme exactly
 * @param {'markdown' | 'html'} format
 * @param {string} alt
 * @param {(theme: string) => string} urlFor builds the badge URL for a theme
 * @param {string} theme selected theme option
 * @returns {string}
 */
export function snippet(format, alt, urlFor, theme) {
  if (format === 'markdown') return `![${escMd(alt)}](${urlFor(theme)})`;
  return `<picture><source media="(prefers-color-scheme: dark)" srcset="${urlFor('dark')}"><img src="${urlFor('light')}" alt="${escAttr(alt)}"></picture>`;
}
