#!/usr/bin/env node
// Writes a small search index for the gallery.
// The full simple-icons package is ~6.5 MB (mostly SVG paths) – far too big for a
// browser. The gallery only needs names to search; the badges themselves are
// rendered by the worker.

import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import * as simpleIcons from 'simple-icons';
import { resolveIcon } from '../../src/icons.mjs';

const OUT = new URL('../src/generated/', import.meta.url);

// [slug, title] pairs, sorted by title
const brands = Object.values(simpleIcons)
  .map((i) => [i.slug, i.title])
  .sort((a, b) => a[1].localeCompare(b[1]));

// Lucide names come from the package's file names ("shield-check.mjs"), keeping only
// those the worker can actually resolve
const lucideDir = join(dirname(createRequire(import.meta.url).resolve('lucide-static/package.json')), 'dist/esm/icons');
const lucideNames = readdirSync(lucideDir)
  .filter((f) => f.endsWith('.mjs'))
  .map((f) => f.slice(0, -4))
  .filter((name) => resolveIcon(`lucide:${name}`))
  .sort();

mkdirSync(OUT, { recursive: true });
writeFileSync(new URL('brands.json', OUT), JSON.stringify(brands));
writeFileSync(new URL('lucide.json', OUT), JSON.stringify(lucideNames));
console.log(`Index: ${brands.length} brands, ${lucideNames.length} Lucide icons`);
