#!/usr/bin/env node
// Downloads the shields.io badges for the comparison section into site/public/compare/.
// Serving copies from mmbadges.com means visitors' browsers never contact a third party
// (no IP addresses sent to img.shields.io). shields.io badges are CC0.
//
// Usage: node site/scripts/fetch-comparison.mjs

import { mkdirSync, writeFileSync } from 'node:fs';

const SHIELDS = 'https://img.shields.io/badge';

export const COMPARISON = {
  react: `${SHIELDS}/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB`,
  typescript: `${SHIELDS}/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white`,
  docker: `${SHIELDS}/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white`,
  build: `${SHIELDS}/build-passing-brightgreen?logo=githubactions&logoColor=white`,
  coverage: `${SHIELDS}/coverage-94%25-brightgreen`,
  license: `${SHIELDS}/license-MIT-blue`,
};

const OUT = new URL('../public/compare/', import.meta.url);
mkdirSync(OUT, { recursive: true });

for (const [name, url] of Object.entries(COMPARISON)) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  writeFileSync(new URL(`${name}.svg`, OUT), await res.text());
  console.log(`compare/${name}.svg`);
}
