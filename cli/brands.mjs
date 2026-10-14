#!/usr/bin/env node
// Generates brand badges as files (light, dark and auto) plus GALLERY.md.
//
// Usage:
//   node cli/brands.mjs                       -> default list
//   node cli/brands.mjs react docker python   -> custom selection (Simple Icons slugs)
//   node cli/brands.mjs "nextdotjs:Next.js"   -> custom label
//
// Options:
//   --size=sm|md|lg       sm = 20px, md = 24px (default), lg = 28px
//   --style=mono|brand|tint

import { mkdirSync, writeFileSync } from 'node:fs';
import { renderBrand } from '../src/brands.mjs';
import { brandIcon } from '../src/icons.mjs';
import { esc } from '../src/lib.mjs';

const OUT = 'badges';

const DEFAULT = [
  'javascript', 'typescript', 'python', 'rust', 'go', 'react', 'vuedotjs',
  'svelte', 'nextdotjs', 'nodedotjs', 'tailwindcss', 'docker', 'kubernetes',
  'postgresql', 'mongodb', 'redis', 'github', 'githubactions', 'vercel', 'figma',
];

const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('='))
);
const opts = { size: flags.size || 'md', style: flags.style || 'mono' };

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const list = args.length ? args : DEFAULT;

mkdirSync(OUT, { recursive: true });
const rows = [];

for (const entry of list) {
  const [slug, customLabel] = entry.split(':');
  const icon = brandIcon(slug);
  if (!icon) {
    console.warn(`No icon found for "${slug}" – see simpleicons.org for slugs`);
    continue;
  }
  const label = customLabel || icon.title;
  for (const theme of ['light', 'dark', 'auto'])
    writeFileSync(`${OUT}/${icon.slug}-${theme}.svg`, renderBrand({ icon, label, theme, ...opts }));
  rows.push({ slug: icon.slug, label });
}

// Gallery with copy-paste snippets (follows the GitHub theme)
const snippet = (r, base = OUT) =>
  `<picture><source media="(prefers-color-scheme: dark)" srcset="${base}/${r.slug}-dark.svg"><img src="${base}/${r.slug}-light.svg" alt="${esc(r.label)}"></picture>`;

const md = `# Badge Gallery

${rows.map((r) => snippet(r)).join('\n')}

## Snippets

${rows.map((r) => `### ${r.label}\n\n\`\`\`html\n${snippet(r)}\n\`\`\``).join('\n\n')}
`;
writeFileSync('GALLERY.md', md);
console.log(`Generated ${rows.length} badges (light, dark + auto each) in ./${OUT}, gallery in GALLERY.md`);
