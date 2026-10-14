// Pure helpers that build badge URLs and copy-paste snippets.
// Defaults are left out so URLs stay short and match the worker's cache key.

/** @typedef {{ theme?: string, style?: string, size?: string, label?: string, state?: string }} BadgeOptions */

const DEFAULTS = { theme: 'auto', style: 'mono', size: 'md', label: '', state: 'neutral' };

// encodeURIComponent, but keep ":" readable ("si:npm" instead of "si%3Anpm")
const segment = (s) => encodeURIComponent(s).replace(/%3A/gi, ':');

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
 * @param {string} base e.g. "https://mmbadges.mmbadges.workers.dev"
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
