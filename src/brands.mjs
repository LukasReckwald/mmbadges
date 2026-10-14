// Brand badges: a minimal pill with a logo from Simple Icons (CC0).
//
// Styles:
//   mono  = neutral pill, logo + text in the text color (default)
//   brand = neutral pill, logo + text in the brand color
//   tint  = pill tinted with the brand color
// Logo and text always share the same color.

import { FONT_STACK, DARK_BG, DARK_TEXT, textWidth, mix, lum, ensure, NEUTRAL, esc, paint } from './lib.mjs';
import { getSize } from './sizes.mjs';
import { iconMarkup } from './icons.mjs';

export const STYLES = ['mono', 'brand', 'tint'];

// ---------- Colors per theme ----------
export function colors(brand, theme, style) {
  const n = NEUTRAL[theme];
  let c;
  if (style === 'brand') {
    // Adjust the brand color until it is readable as text (WCAG 4.5:1)
    const toward = theme === 'light' ? '#000000' : '#ffffff';
    c = { ...n, text: isNearBlack(brand) ? n.text : ensure(brand, n.bg, theme === 'light' ? 4.5 : 6, toward) };
  } else if (style === 'tint') {
    c = theme === 'light' ? lightColors(brand) : darkColors(brand);
  } else {
    c = { ...n };
  }
  return { ...c, logo: c.text };
}

// Near-black brands (GitHub, Vercel, Next.js …) get neutral tones
const isNearBlack = (h) => lum(h) < 0.02;

function lightColors(brand) {
  if (isNearBlack(brand)) return { bg: '#f6f8fa', border: '#d0d7de', logo: brand, text: '#1f2328' };
  const bg = mix(brand, '#ffffff', 0.88);
  return {
    bg,
    border: mix(brand, '#ffffff', 0.65),
    logo: ensure(brand, bg, 2.2, '#000000'),
    text: ensure(mix(brand, '#000000', 0.55), bg, 7, '#000000'),
  };
}
function darkColors(brand) {
  if (isNearBlack(brand)) return { bg: DARK_BG, border: '#3d444d', logo: DARK_TEXT, text: DARK_TEXT };
  return {
    bg: DARK_BG,
    border: ensure(mix(brand, DARK_BG, 0.55), DARK_BG, 1.6, '#ffffff'),
    logo: ensure(brand, DARK_BG, 3, '#ffffff'),
    text: DARK_TEXT,
  };
}

// ---------- SVG ----------
/**
 * Render a brand badge.
 * @param {object} opts
 * @param {{ title: string, hex: string, path: string }} opts.icon entry from simple-icons, see brandIcon()
 * @param {string} [opts.label] defaults to the brand name
 * @param {'auto' | 'light' | 'dark'} [opts.theme]
 * @param {'mono' | 'brand' | 'tint'} [opts.style]
 * @param {'sm' | 'md' | 'lg'} [opts.size]
 * @returns {string} SVG document
 */
export function renderBrand({ icon, label = icon.title, theme = 'auto', style = 'mono', size = 'md' }) {
  const { H, PAD, ICON, GAP, FONT, WEIGHT } = getSize(size);
  const brand = '#' + icon.hex;
  const palettes = { light: colors(brand, 'light', style), dark: colors(brand, 'dark', style) };
  const { attrs: a, style: css } = paint(theme, palettes, {
    bg: { fill: 'bg', stroke: 'border' },
    logo: { fill: 'logo' },
    text: { fill: 'text' },
  });

  const tw = textWidth(label, FONT);
  const w = Math.ceil(PAD + ICON + GAP + tw + PAD);
  const iy = (H - ICON) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
${css}<rect x="0.5" y="0.5" width="${w - 1}" height="${H - 1}" rx="${(H - 1) / 2}" ${a.bg}/>
${iconMarkup({ type: 'si', body: icon.path }, a.logo, PAD, iy, ICON)}
<text x="${PAD + ICON + GAP}" y="${H / 2}" dominant-baseline="central" ${a.text} font-family="${FONT_STACK}" font-size="${FONT}" font-weight="${WEIGHT}" textLength="${tw}" lengthAdjust="spacingAndGlyphs">${esc(label)}</text>
</svg>
`;
}
