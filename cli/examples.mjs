#!/usr/bin/env node
// Generates docs/examples.svg for the README: every style and some status badges,
// once on a light and once on a dark surface. GitHub strips styling from Markdown
// tables, so one image is the only way to show both backgrounds side by side.
//
// Usage: npm run examples

import { mkdirSync, writeFileSync } from 'node:fs';
import { renderBrand } from '../src/brands.mjs';
import { renderStatus } from '../src/status.mjs';
import { brandIcon, resolveIcon } from '../src/icons.mjs';
import { FONT_STACK } from '../src/lib.mjs';

const BRANDS = ['javascript', 'svelte', 'vuedotjs', 'kotlin', 'nextdotjs'];
const STATUS = [
  ['si:githubactions', 'build', 'passing', 'success'],
  ['si:githubactions', 'build', 'failing', 'danger'],
  ['lucide:shield-check', 'coverage', '87%', 'auto'],
  ['lucide:shield-check', 'coverage', '64%', 'auto'],
  ['lucide:shield-check', 'coverage', '41%', 'auto'],
  ['lucide:tag', 'version', 'v1.4.2', 'info'],
  ['lucide:scale', 'license', 'MIT', 'neutral'],
];

const SURFACES = {
  light: { bg: '#ffffff', border: '#d1d9e0', text: '#59636e' },
  dark: { bg: '#0d1117', border: '#3d444d', text: '#9198a1' },
};

const WIDTH = 880;
const PAD = 24; // inside a panel
const LABEL_W = 64; // column for "mono", "brand", …
const ROW_H = 36;
const GAP = 8; // between badges
const PANEL_GAP = 16;

// A rendered badge is a complete <svg>; nested <svg> elements are valid SVG,
// so we only need its width to lay it out.
const widthOf = (svg) => Number(svg.match(/width="([\d.]+)"/)[1]);
const place = (svg, x, y) => svg.replace('<svg ', `<svg x="${x}" y="${y}" `);

function rows(theme) {
  const brandRows = ['mono', 'brand', 'tint'].map((style) => ({
    label: style,
    badges: BRANDS.map((slug) => renderBrand({ icon: brandIcon(slug), theme, style })),
  }));
  const status = STATUS.map(([spec, label, value, state]) =>
    renderStatus({ icon: resolveIcon(spec), label, value, state, theme }),
  );
  // Status badges are wider, so they get two rows
  return [...brandRows, { label: 'status', badges: status.slice(0, 4) }, { label: '', badges: status.slice(4) }];
}

function panel(theme, y) {
  const s = SURFACES[theme];
  const list = rows(theme);
  const height = PAD * 2 + 20 + list.length * ROW_H;
  let out = `<rect x="0.5" y="${y + 0.5}" width="${WIDTH - 1}" height="${height - 1}" rx="12" fill="${s.bg}" stroke="${s.border}"/>`;
  out += `<text x="${PAD}" y="${y + PAD + 10}" fill="${s.text}" font-family="${FONT_STACK}" font-size="12" font-weight="600">${theme === 'light' ? 'Light' : 'Dark'}</text>`;
  list.forEach((row, i) => {
    const rowY = y + PAD + 20 + i * ROW_H + (ROW_H - 24) / 2;
    out += `<text x="${PAD}" y="${rowY + 12}" dominant-baseline="central" fill="${s.text}" font-family="${FONT_STACK}" font-size="12">${row.label}</text>`;
    let x = PAD + LABEL_W;
    for (const badge of row.badges) {
      out += place(badge, x, rowY);
      x += widthOf(badge) + GAP;
    }
  });
  return { svg: out, height };
}

const light = panel('light', 0);
const dark = panel('dark', light.height + PANEL_GAP);
const height = light.height + PANEL_GAP + dark.height;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-label="mmbadges examples in light and dark">
${light.svg}
${dark.svg}
</svg>
`;

mkdirSync('docs', { recursive: true });
writeFileSync('docs/examples.svg', svg);
console.log(`docs/examples.svg written (${WIDTH}×${height})`);
