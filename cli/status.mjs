#!/usr/bin/env node
// Generates status badges as files (light, dark and auto).
//
// Usage:
//   node cli/status.mjs                                  -> demo set
//   node cli/status.mjs "si:githubactions|build|passing|success"
//   node cli/status.mjs "lucide:shield-check|coverage|87%|auto"
//
// Entry format:  icon|label|value|state
//   icon     si:<slug> (Simple Icons) or lucide:<name> (lucide.dev)
//   state    success | warning | danger | info | neutral | auto
//
// Options: --size=sm|md|lg (default md)

import { mkdirSync, writeFileSync } from 'node:fs';
import { renderStatus } from '../src/status.mjs';
import { resolveIcon } from '../src/icons.mjs';

const OUT = 'badges/status';

const DEMO = [
  'si:githubactions|build|passing|success',
  'si:githubactions|build|failing|danger',
  'lucide:test-tube|tests|248 passed|success',
  'lucide:shield-check|coverage|94%|auto',
  'lucide:shield-check|coverage|67%|auto',
  'lucide:scale|license|MIT|neutral',
  'lucide:tag|version|v1.4.2|info',
  'si:npm|downloads|12k/month|neutral',
  'lucide:star|stars|1.2k|neutral',
];

const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('='))
);
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));

mkdirSync(OUT, { recursive: true });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

let count = 0;
for (const entry of args.length ? args : DEMO) {
  const [spec, label, value, state = 'neutral'] = entry.split('|');
  const icon = resolveIcon(spec);
  if (!icon) {
    console.warn(`Icon "${spec}" not found (use si:<slug> or lucide:<name>)`);
    continue;
  }
  const name = `${slug(label)}-${slug(value)}`;
  for (const theme of ['light', 'dark', 'auto'])
    writeFileSync(`${OUT}/${name}-${theme}.svg`, renderStatus({ icon, label, value, state, theme, size: flags.size }));
  count++;
}
console.log(`Generated ${count} status badges (light, dark + auto each) in ./${OUT}`);
