# Contributing to mmbadges

Thanks for your interest! Bug reports, ideas and pull requests are welcome.

## Setup

```sh
nvm use           # Node.js 22, see .nvmrc
npm install
npm test
npm run dev       # gallery + worker on http://localhost:8787
npm run site:dev  # gallery with hot reload on http://localhost:5173 (run `npm run dev` alongside)
```

## Project structure

```
src/      pure render functions – no file system, no network, no CLI
  lib.mjs       color math (WCAG contrast), text width, paint() for themes
  sizes.mjs     dimensions for sm/md/lg
  icons.mjs     icon lookup (Simple Icons, Lucide)
  brands.mjs    brand badges
  status.mjs    status badges
cli/      thin wrappers that write SVG files
worker/   thin wrapper that serves SVGs over HTTP (Cloudflare Worker)
site/     gallery website (React + Vite), served as static assets by the same worker
  scripts/      builds the search index from simple-icons and lucide-static
  src/lib/      pure helpers (URLs, snippets, search) – tested in test/site.test.mjs
  src/components/  React components (hero, logo gallery, status builder)
test/     vitest tests and snapshots
```

Most changes – a new style, size or badge type – belong in `src/`. Keep `src/` free of Node- or Cloudflare-specific APIs so it runs everywhere.

## Design principles

- **Minimal.** One pill shape, no gradients, no shadows. New options should earn their place.
- **Readable.** Text colors must meet WCAG contrast against their background (use `ensure()` in `src/lib.mjs`).
- **Both themes.** Every badge works in light and dark mode; `theme=auto` must contain the same colors as the fixed themes.
- **Always an SVG.** The worker never returns a broken image – errors become error badges.
- **Safe.** User text is always escaped with `esc()`.

## Tests and snapshots

Snapshot tests store the exact SVG output in `test/__snapshots__/`. If you change how badges look **on purpose**, update them:

```sh
npx vitest -u
```

and mention the visual change in your pull request (a before/after screenshot helps). If a snapshot changes and you did not intend it, that's a bug.

## Pull requests

1. Run `npm run format` and `npm test` before pushing – CI checks both.
2. Keep pull requests focused on one change.
3. Write code comments, commit messages and docs in English.

## Deployment (maintainers)

`npm run deploy` builds the gallery and deploys the worker to `mmbadges.com`. The domain's DNS is managed by Cloudflare.
`www.mmbadges.com` is attached to the worker only so Cloudflare creates its DNS record and certificate; a redirect rule
in the dashboard (Rules → Redirect Rules → "Redirect from WWW to root") sends it to `mmbadges.com` before the worker runs.

After changing routes, Cloudflare may serve old responses from its cache for a while – purge the cache in the dashboard
(Caching → Purge Everything) if needed.
