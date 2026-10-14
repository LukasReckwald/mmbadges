# mmbadges

**README badges that don't look like 2014.**

Modern minimal badges for Markdown. Clean pills, real brand logos (3000+ from [Simple Icons](https://simpleicons.org)), clean line icons from [Lucide](https://lucide.dev), and automatic light and dark mode – from a single URL.

> 🚧 Early development. The hosted service is not public yet; the base URL below is a placeholder.

## Usage

Pick a logo and copy the snippet in the **[gallery](https://mmbadges.com)**, or paste a URL into any Markdown file:

```md
![React](https://mmbadges.com/brand/react.svg)
![build](https://mmbadges.com/status/si:githubactions/build/passing.svg?state=success)
```

By default (`theme=auto`) a badge contains both color palettes and follows the viewer's system color scheme. If you want badges to follow the **GitHub** theme setting exactly, use a `<picture>` element with fixed themes:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://mmbadges.com/brand/react.svg?theme=dark" />
  <img src="https://mmbadges.com/brand/react.svg?theme=light" alt="React" />
</picture>
```

## Badge types

### Brand badges

```
/brand/{slug}.svg
```

`{slug}` is a [Simple Icons](https://simpleicons.org) slug, e.g. `react`, `nextdotjs`, `docker`.

| Parameter | Values                                | Default    |
| --------- | ------------------------------------- | ---------- |
| `theme`   | `auto`, `light`, `dark`               | `auto`     |
| `style`   | `mono`, `brand`, `tint`               | `mono`     |
| `size`    | `sm` (20px), `md` (24px), `lg` (28px) | `md`       |
| `label`   | any text (max. 64 characters)         | brand name |

- `mono` – neutral pill, logo and text in the text color
- `brand` – neutral pill, logo and text in the brand color (adjusted for WCAG contrast)
- `tint` – pill tinted with the brand color

### Status badges

```
/status/{icon}/{label}/{value}.svg
```

`{icon}` is `si:<slug>` (Simple Icons) or `lucide:<name>` (Lucide), e.g. `lucide:shield-check`.

| Parameter | Values                                                    | Default   |
| --------- | --------------------------------------------------------- | --------- |
| `state`   | `success`, `warning`, `danger`, `info`, `neutral`, `auto` | `neutral` |
| `theme`   | `auto`, `light`, `dark`                                   | `auto`    |
| `size`    | `sm`, `md`, `lg`                                          | `md`      |

`state=auto` colors percentages by threshold: ≥ 80 green, ≥ 60 yellow, otherwise red.

URL-encode special characters in path segments – `%` becomes `%25`, a space `%20`:

```
/status/lucide:shield-check/coverage/87%25.svg?state=auto
```

Invalid requests still return an SVG (e.g. `badge: unknown logo`), so a README never shows a broken image.

## Generate files locally

Prefer to commit SVG files instead of using the service?

```sh
npm install
npm run brands -- react docker "nextdotjs:Next.js" --style=brand
npm run status -- "lucide:shield-check|coverage|87%|auto"
```

Files are written to `badges/` (light, dark and auto variants), plus a `GALLERY.md` with copy-paste snippets.

## Development

Requires Node.js 22 (see `.nvmrc`).

```sh
npm install
npm test          # unit and worker tests (vitest)
npm run dev       # build the gallery and run the worker on http://localhost:8787
npm run site:dev  # gallery with hot reload on http://localhost:5173 (needs `npm run dev` for the badges)
npm run format    # format code with Prettier
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the project structure and guidelines.

## Roadmap

- [x] Badge service on Cloudflare Workers
- [x] Gallery website with search and copy buttons
- [ ] Live badges (GitHub Actions, stars, npm, Codecov)

## Credits

- Brand icons by [Simple Icons](https://github.com/simple-icons/simple-icons) (CC0-1.0). Brand names and logos are trademarks of their respective owners; please respect their brand guidelines.
- Line icons by [Lucide](https://github.com/lucide-icons/lucide) (ISC License, © Lucide Contributors).

## License

[MIT](LICENSE)
