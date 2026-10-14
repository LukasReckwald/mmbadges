// Status badges (build, coverage, license, version …) in the same pill style.
//
// Left: icon and label in a muted text color (always the same),
// right: the value in the state color.
//   state  success | warning | danger | info | neutral | auto
//          auto: percentages are colored by threshold (>=80 green, >=60 yellow, else red)

import { FONT_STACK, NEUTRAL, textWidth, esc, paint } from './lib.mjs';
import { getSize } from './sizes.mjs';
import { iconMarkup } from './icons.mjs';

export const STATES = ['success', 'warning', 'danger', 'info', 'neutral', 'auto'];

// State colors (based on GitHub Primer, readable on the matching background)
const STATE = {
  light: { success: '#1a7f37', warning: '#9a6700', danger: '#cf222e', info: '#0969da' },
  dark: { success: '#3fb950', warning: '#d29922', danger: '#f85149', info: '#4493f8' },
};
// Muted color for icon + label
const MUTED = { light: '#59636e', dark: '#9198a1' };

/**
 * Turn "auto" into a concrete state based on a percentage value.
 * @param {string} state
 * @param {string} value e.g. "87%"
 * @returns {string} success | warning | danger | info | neutral
 */
export function resolveState(state, value) {
  if (state !== 'auto') return state;
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 'neutral';
  return n >= 80 ? 'success' : n >= 60 ? 'warning' : 'danger';
}

const palette = (theme, state) => ({
  ...NEUTRAL[theme],
  muted: MUTED[theme],
  value: state === 'neutral' ? NEUTRAL[theme].text : STATE[theme][state],
});

/**
 * Render a two-part status badge.
 * @param {object} opts
 * @param {import('./icons.mjs').Icon} opts.icon result of resolveIcon()
 * @param {string} opts.label left part, e.g. "build"
 * @param {string} opts.value right part, e.g. "passing"
 * @param {'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'auto'} [opts.state]
 * @param {'auto' | 'light' | 'dark'} [opts.theme]
 * @param {'sm' | 'md' | 'lg'} [opts.size]
 * @returns {string} SVG document
 */
export function renderStatus({ icon, label, value, state = 'neutral', theme = 'auto', size = 'md' }) {
  const { H, PAD, ICON, GAP, FONT } = getSize(size);
  const s = resolveState(state, value);
  const palettes = { light: palette('light', s), dark: palette('dark', s) };
  const { attrs: a, style: css } = paint(theme, palettes, {
    bg: { fill: 'bg', stroke: 'border' },
    sep: { stroke: 'border' },
    icon: icon.type === 'si' ? { fill: 'muted' } : { stroke: 'muted' },
    label: { fill: 'muted' },
    value: { fill: 'value' },
  });

  const lw = textWidth(label, FONT);
  const vw = textWidth(value, FONT);
  const left = PAD + ICON + GAP + lw + PAD - 2; // icon + label
  const right = PAD - 2 + vw + PAD; // value
  const w = Math.ceil(left + right);
  const iy = (H - ICON) / 2;
  const t = (x, txt, tw, attr, weight) =>
    `<text x="${x}" y="${H / 2}" dominant-baseline="central" ${attr} font-family="${FONT_STACK}" font-size="${FONT}" font-weight="${weight}" textLength="${tw}" lengthAdjust="spacingAndGlyphs">${esc(txt)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" role="img" aria-label="${esc(`${label}: ${value}`)}">
<title>${esc(`${label}: ${value}`)}</title>
${css}<rect x="0.5" y="0.5" width="${w - 1}" height="${H - 1}" rx="${(H - 1) / 2}" ${a.bg}/>
<line x1="${left}" y1="5" x2="${left}" y2="${H - 5}" ${a.sep}/>
${iconMarkup(icon, a.icon, PAD, iy, ICON)}
${t(PAD + ICON + GAP, label, lw, a.label, 500)}
${t(left + PAD - 2, value, vw, a.value, 600)}
</svg>
`;
}
