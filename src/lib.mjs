// Shared building blocks for all badge types

export const FONT_STACK = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export const DARK_BG = '#161b22';
export const DARK_TEXT = '#e6edf3';

// Character widths (Arial/Liberation Sans Bold, 1/1000 em) for ASCII 32–126
// prettier-ignore
const W = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
export const textWidth = (s, font) =>
  Math.round(([...s].reduce((w, ch) => w + (W[ch.charCodeAt(0) - 32] ?? 611), 0) * font) / 100) / 10;

// ---------- Color math ----------
export const hexToRgb = (h) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));
export const rgbToHex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => rgbToHex(hexToRgb(a).map((v, i) => v + (hexToRgb(b)[i] - v) * t));
export const lum = (h) => {
  const [r, g, b] = hexToRgb(h).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/**
 * WCAG contrast ratio between two colors (1 = none, 21 = black on white).
 * @param {string} a hex color, e.g. "#1f2328"
 * @param {string} b hex color
 * @returns {number}
 */
export const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
/**
 * Shift a color toward `toward` until its contrast against `bg` is high enough.
 * @param {string} fg color to adjust
 * @param {string} bg background color
 * @param {number} min minimum contrast ratio, e.g. 4.5
 * @param {string} toward usually "#000000" (light theme) or "#ffffff" (dark theme)
 * @returns {string} adjusted hex color
 */
export const ensure = (fg, bg, min, toward) => {
  let c = fg;
  for (let t = 0.05; contrast(c, bg) < min && t <= 1; t += 0.05) c = mix(fg, toward, t);
  return c;
};

export const NEUTRAL = {
  light: { bg: '#f6f8fa', border: '#d0d7de', text: '#1f2328' },
  dark: { bg: DARK_BG, border: '#3d444d', text: DARK_TEXT },
};

export const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const THEMES = ['auto', 'light', 'dark'];

// ---------- Writing colors into the SVG ----------
// `palettes` = { light: {...}, dark: {...} } with named colors,
// `roles`    = { role: { css-property: colorName } }, e.g. { bg: { fill: 'bg', stroke: 'border' } }
//
// Fixed themes (light/dark) write the colors directly into the element as attributes.
// "auto" gives each element a class and puts both palettes into a <style> block that
// switches via prefers-color-scheme. That way a single URL works for light and dark.
/** @typedef {'auto' | 'light' | 'dark'} Theme */

/**
 * @param {Theme} theme
 * @param {{ light: Record<string, string>, dark: Record<string, string> }} palettes
 * @param {Record<string, Record<string, string>>} roles
 * @returns {{ attrs: Record<string, string>, style: string }} attribute string per role, plus the <style> block (auto only)
 */
export function paint(theme, palettes, roles) {
  const entries = Object.entries(roles);
  if (theme !== 'auto') {
    const p = palettes[theme];
    const attrs = Object.fromEntries(
      entries.map(([role, props]) => [
        role,
        Object.entries(props)
          .map(([prop, key]) => `${prop}="${p[key]}"`)
          .join(' '),
      ]),
    );
    return { attrs, style: '' };
  }
  const css = (p) =>
    entries
      .map(
        ([role, props]) =>
          `.mm-${role}{${Object.entries(props)
            .map(([prop, key]) => `${prop}:${p[key]}`)
            .join(';')}}`,
      )
      .join('');
  return {
    attrs: Object.fromEntries(entries.map(([role]) => [role, `class="mm-${role}"`])),
    style: `<style>${css(palettes.light)}@media (prefers-color-scheme:dark){${css(palettes.dark)}}</style>\n`,
  };
}
