#!/usr/bin/env node
// Generates docs/banner.svg for the README: a light and a dark half, badges at three
// depths, and the wordmark in the middle. Every badge (and the wordmark) is drawn twice –
// light variant clipped to the left half, dark variant clipped to the right half – so a
// badge that crosses the middle switches its theme exactly at the edge.
//
// Usage: npm run banner          -> docs/banner.svg (README, 1280×400)
//        npm run banner -- --og  -> site/public/og.png (link previews, 1200×630)

import { mkdirSync, writeFileSync } from 'node:fs';
import { renderBrand } from '../src/brands.mjs';
import { renderStatus } from '../src/status.mjs';
import { brandIcon, resolveIcon } from '../src/icons.mjs';
import { FONT_STACK } from '../src/lib.mjs';

// --og renders the same design as a 1200×630 PNG for link previews (Open Graph);
// social networks don't accept SVG there.
const OG = process.argv.includes('--og');
const W = OG ? 1200 : 1280;
const H = OG ? 630 : 400;
const ZOOM = OG ? 1.25 : 1; // larger badges and text on the taller preview image
const MID = W / 2;

// Badges to scatter: [kind, ...args]
const BADGES = [
  ['brand', 'react', 'brand'],
  ['brand', 'typescript', 'tint'],
  ['brand', 'javascript', 'brand'],
  ['brand', 'python', 'mono'],
  ['brand', 'rust', 'mono'],
  ['brand', 'go', 'tint'],
  ['brand', 'svelte', 'tint'],
  ['brand', 'vuedotjs', 'brand'],
  ['brand', 'kotlin', 'tint'],
  ['brand', 'swift', 'brand'],
  ['brand', 'docker', 'brand'],
  ['brand', 'kubernetes', 'mono'],
  ['brand', 'postgresql', 'tint'],
  ['brand', 'redis', 'brand'],
  ['brand', 'nextdotjs', 'mono'],
  ['brand', 'tailwindcss', 'brand'],
  ['brand', 'figma', 'tint'],
  ['brand', 'github', 'mono'],
  ['brand', 'nodedotjs', 'brand'],
  ['brand', 'deno', 'mono'],
  ['brand', 'vite', 'tint'],
  ['brand', 'astro', 'brand'],
  ['brand', 'supabase', 'tint'],
  ['brand', 'cloudflare', 'brand'],
  ['brand', 'angular', 'brand'],
  ['brand', 'django', 'tint'],
  ['brand', 'flutter', 'brand'],
  ['brand', 'graphql', 'tint'],
  ['brand', 'mongodb', 'brand'],
  ['brand', 'vercel', 'mono'],
  ['brand', 'php', 'tint'],
  ['brand', 'ruby', 'brand'],
  ['brand', 'laravel', 'tint'],
  ['brand', 'spring', 'brand'],
  ['brand', 'prisma', 'mono'],
  ['brand', 'bun', 'mono'],
  ['brand', 'nuxt', 'tint'],
  ['brand', 'sass', 'brand'],
  ['brand', 'terraform', 'tint'],
  ['brand', 'linux', 'mono'],
  ['brand', 'firebase', 'brand'],
  ['brand', 'elixir', 'tint'],
  ['status', 'si:githubactions', 'build', 'passing', 'success'],
  ['status', 'lucide:shield-check', 'coverage', '94%', 'auto'],
  ['status', 'lucide:tag', 'version', 'v2.1.0', 'info'],
  ['status', 'lucide:scale', 'license', 'MIT', 'neutral'],
  ['status', 'lucide:test-tube', 'tests', '312 passed', 'success'],
  ['status', 'si:npm', 'downloads', '48k/week', 'neutral'],
  ['status', 'lucide:star', 'stars', '2.4k', 'neutral'],
  ['status', 'lucide:triangle-alert', 'lint', '3 warnings', 'warning'],
  ['status', 'lucide:shield-check', 'coverage', '58%', 'auto'],
  ['status', 'si:githubactions', 'deploy', 'failing', 'danger'],
  ['status', 'lucide:git-pull-request', 'PRs', '12 open', 'info'],
  ['status', 'lucide:package', 'size', '4.2 kB', 'neutral'],
];

// Three depth layers: back (small, faint, blurred) → front (large, with shadow)
const LAYERS = [
  { scale: 0.75 * ZOOM, opacity: 0.5, filter: 'url(#blur)', count: 22 },
  { scale: 1 * ZOOM, opacity: 0.8, filter: '', count: 18 },
  { scale: 1.4 * ZOOM, opacity: 1, filter: 'url(#shadow)', count: 12 },
];

// Area kept free for the wordmark
const CENTER = { x: MID - 270 * ZOOM, y: H / 2 - 74 * ZOOM, w: 540 * ZOOM, h: 148 * ZOOM };

// Small seeded random generator (mulberry32), so the banner looks the same on every run
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function render(spec, theme) {
  const [kind, ...a] = spec;
  if (kind === 'brand') return renderBrand({ icon: brandIcon(a[0]), style: a[1], theme });
  return renderStatus({ icon: resolveIcon(a[0]), label: a[1], value: a[2], state: a[3], theme });
}

const sizeOf = (svg) => {
  const [, w, h] = svg.match(/width="([\d.]+)" height="([\d.]+)"/);
  return { w: Number(w), h: Number(h) };
};

// Position and scale a rendered badge (a complete <svg>) inside the banner
const place = (svg, x, y, s) =>
  svg.replace(/^<svg xmlns="[^"]+" width="([\d.]+)" height="([\d.]+)"/, (_, w, h) => {
    return `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(w * s).toFixed(1)}" height="${(h * s).toFixed(1)}"`;
  });

const overlaps = (a, b, m) => a.x < b.x + b.w + m && a.x + a.w + m > b.x && a.y < b.y + b.h + m && a.y + a.h + m > b.y;

// Badges placed across the middle on purpose, mostly tint and mono: there the switch is
// easiest to see (tint changes background and text, mono flips its neutral grays).
// [layer, badge, y, share of the badge on the light side]
const CROSSING = [
  [2, ['brand', 'svelte', 'tint'], 36, 0.5],
  [2, ['brand', 'github', 'mono'], 328, 0.45],
  [1, ['brand', 'typescript', 'tint'], 96, 0.6],
  [1, ['brand', 'rust', 'mono'], 290, 0.4],
  [0, ['brand', 'vuedotjs', 'tint'], 10, 0.55],
  [0, ['brand', 'docker', 'mono'], 372, 0.5],
];

const random = rng(7);
const placed = [];

for (const [li, spec, y, share] of CROSSING) {
  const layer = LAYERS[li];
  const { w, h } = sizeOf(render(spec, 'light'));
  const box = { w: w * layer.scale, h: h * layer.scale, y: (y * H) / 400 }; // y is given for the 400px banner
  box.x = MID - box.w * share;
  placed.push({ spec, box, layer });
}

// Everything else is scattered at random, without overlaps and away from the wordmark
const crossingSlugs = new Set(CROSSING.map(([, spec]) => spec[1]));
const pool = BADGES.filter(([kind, slug]) => !(kind === 'brand' && crossingSlugs.has(slug)));
const take = () => pool.splice(Math.floor(random() * pool.length), 1)[0];

for (const layer of LAYERS) {
  for (let n = 0; n < layer.count && pool.length; n++) {
    const spec = take();
    const { w, h } = sizeOf(render(spec, 'light'));
    const box = { w: w * layer.scale, h: h * layer.scale };
    for (let tries = 0; tries < 2000; tries++) {
      box.x = 8 + random() * (W - box.w - 16);
      box.y = 8 + random() * (H - box.h - 16);
      // Keep the middle line for the deliberate crossing badges
      if (box.x < MID + 8 && box.x + box.w > MID - 8) continue;
      if (overlaps(box, CENTER, 8)) continue;
      if (placed.some((p) => overlaps(box, p.box, 6))) continue;
      placed.push({ spec, box, layer });
      break;
    }
  }
}

// Draw back to front: each badge once per half
const halves = ['light', 'dark'];
let badgesSvg = '';
for (const [li] of LAYERS.entries()) {
  for (const p of placed.filter((q) => q.layer === LAYERS[li])) {
    const g = (theme) => place(render(p.spec, theme), p.box.x, p.box.y, p.layer.scale);
    badgesSvg += `<g opacity="${p.layer.opacity}"${p.layer.filter ? ` filter="${p.layer.filter}"` : ''}>`;
    for (const theme of halves) badgesSvg += `<g clip-path="url(#clip-${theme})">${g(theme)}</g>`;
    badgesSvg += '</g>\n';
  }
}

// Wordmark: dark text on the light half, light text on the dark half
const text = (fill) =>
  `<text x="${MID}" y="${H / 2 + 6}" text-anchor="middle" fill="${fill}" font-family="${FONT_STACK}" font-size="${92 * ZOOM}" font-weight="700" letter-spacing="-3">mmbadges</text>` +
  `<text x="${MID}" y="${H / 2 + 52 * ZOOM}" text-anchor="middle" fill="${fill}" opacity="0.6" font-family="${FONT_STACK}" font-size="${20 * ZOOM}" font-weight="500">modern minimal badges for Markdown</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="mmbadges – modern minimal badges for Markdown">
<defs>
<clipPath id="clip-light"><rect width="${MID}" height="${H}"/></clipPath>
<clipPath id="clip-dark"><rect x="${MID}" width="${MID}" height="${H}"/></clipPath>
<clipPath id="clip-banner"><rect width="${W}" height="${H}" rx="${OG ? 0 : 16}"/></clipPath>
<linearGradient id="bg-light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef0f3"/></linearGradient>
<linearGradient id="bg-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#161b22"/><stop offset="1" stop-color="#0b0e13"/></linearGradient>
<radialGradient id="fade-light" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
<radialGradient id="fade-dark" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#0d1117" stop-opacity="0.95"/><stop offset="1" stop-color="#0d1117" stop-opacity="0"/></radialGradient>
<filter id="blur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="1.2"/></filter>
<filter id="shadow" x="-20%" y="-50%" width="140%" height="220%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.18"/></filter>
</defs>
<g clip-path="url(#clip-banner)">
<rect width="${MID}" height="${H}" fill="url(#bg-light)"/>
<rect x="${MID}" width="${MID}" height="${H}" fill="url(#bg-dark)"/>
${badgesSvg}
<g clip-path="url(#clip-light)"><ellipse cx="${MID}" cy="${H / 2 + 14}" rx="${340 * ZOOM}" ry="${120 * ZOOM}" fill="url(#fade-light)"/>${text('#1f2328')}</g>
<g clip-path="url(#clip-dark)"><ellipse cx="${MID}" cy="${H / 2 + 14}" rx="${340 * ZOOM}" ry="${120 * ZOOM}" fill="url(#fade-dark)"/>${text('#f0f6fc')}</g>
</g>
</svg>
`;

if (OG) {
  // Render to PNG with resvg (uses the system fonts, like a browser would)
  const { Resvg } = await import('@resvg/resvg-js');
  const png = new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng();
  writeFileSync('site/public/og.png', png);
  console.log(`site/public/og.png written: ${placed.length} badges, ${(png.length / 1024).toFixed(0)} KB`);
} else {
  mkdirSync('docs', { recursive: true });
  writeFileSync('docs/banner.svg', svg);
  console.log(`docs/banner.svg written: ${placed.length} badges, ${(svg.length / 1024).toFixed(0)} KB`);
}
