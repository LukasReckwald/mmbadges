// Icon sources: Simple Icons (brand logos, CC0) and Lucide (line icons, ISC).
// Both packages are imported instead of read from disk, so the same code
// runs in Node (CLI) and in the Cloudflare Worker.

import * as simpleIcons from 'simple-icons';
import * as lucide from 'lucide-static';

const bySlug = Object.fromEntries(Object.values(simpleIcons).map((i) => [i.slug, i]));

// "shield-check" -> "ShieldCheck" (the export names used by lucide-static)
const pascal = (name) =>
  name
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');

/**
 * Look up a Simple Icons entry by slug (case-insensitive).
 * @param {string} slug e.g. "react", "nextdotjs"
 * @returns {{ title: string, slug: string, hex: string, path: string } | undefined}
 */
export const brandIcon = (slug) => bySlug[slug.toLowerCase()];

/** @typedef {{ type: 'si' | 'lucide', body: string }} Icon */

/**
 * Resolve an icon spec: "si:<slug>" (Simple Icons) or "lucide:<name>" (Lucide).
 * @param {string} spec
 * @returns {Icon | null} null if the icon is unknown
 */
export function resolveIcon(spec) {
  const [lib, name = ''] = spec.split(':');
  if (lib === 'si') {
    const icon = brandIcon(name);
    return icon ? { type: 'si', body: icon.path } : null;
  }
  if (lib === 'lucide') {
    const svg = Object.hasOwn(lucide, pascal(name)) ? lucide[pascal(name)] : null;
    if (typeof svg !== 'string') return null;
    // Keep only the content between <svg ...> and </svg>
    const inner = svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>')).trim();
    return { type: 'lucide', body: inner };
  }
  return null;
}

/**
 * Draw an icon at (x, y) with size `px`. `attr` sets the color
 * (fill for Simple Icons, stroke for Lucide), see paint() in lib.mjs.
 * @param {Icon} icon
 * @param {string} attr e.g. 'fill="#1f2328"' or 'class="mm-logo"'
 * @param {number} x
 * @param {number} y
 * @param {number} px icon size in pixels
 * @returns {string} SVG markup
 */
export function iconMarkup(icon, attr, x, y, px) {
  const s = px / 24;
  if (icon.type === 'si') return `<path transform="translate(${x} ${y}) scale(${s})" ${attr} d="${icon.body}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" ${attr} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${icon.body}</g>`;
}
