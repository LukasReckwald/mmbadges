const ROUTES = [
  {
    path: '/brand/{slug}.svg',
    about: '{slug} is a Simple Icons slug, e.g. react, nextdotjs.',
    params: [
      ['style', 'mono, brand, tint', 'mono'],
      ['size', 'sm, md, lg', 'md'],
      ['theme', 'auto, light, dark', 'auto'],
      ['label', 'any text, max. 64 characters', 'brand name'],
    ],
  },
  {
    path: '/status/{icon}/{label}/{value}.svg',
    about: '{icon} is si:<slug> (Simple Icons) or lucide:<name> (Lucide). Encode % as %25.',
    params: [
      ['state', 'success, warning, danger, info, neutral, auto', 'neutral'],
      ['size', 'sm, md, lg', 'md'],
      ['theme', 'auto, light, dark', 'auto'],
    ],
  },
];

// Live badges share the same options: label, size, theme (and branch where noted)
const LIVE_ROUTES = [
  [
    '/github/actions/{owner}/{repo}/{workflow}.svg',
    'Status of the latest workflow run. ?branch= defaults to the default branch.',
  ],
  ['/github/stars/{owner}/{repo}.svg', 'Star count.'],
  ['/github/release/{owner}/{repo}.svg', 'Latest release tag.'],
  ['/github/license/{owner}/{repo}.svg', 'License detected by GitHub.'],
  ['/npm/v/{package}.svg', 'Latest npm version. Scoped: /npm/v/@scope/name.svg'],
  ['/npm/dw/{package}.svg, /npm/dm/{package}.svg', 'Weekly / monthly npm downloads.'],
  ['/codecov/{owner}/{repo}.svg', 'Coverage from Codecov, colored like state=auto. Supports ?branch='],
];

// Plain URL reference for people who prefer writing URLs by hand
export default function Reference() {
  return (
    <section id="reference" className="reference">
      <h2>URL reference</h2>
      <p className="muted">
        theme=auto follows the viewer’s system color scheme. Use light and dark in a &lt;picture&gt; element to follow
        the GitHub theme setting instead. state=auto colors percentages: ≥ 80 green, ≥ 60 yellow, else red.
      </p>
      {ROUTES.map((r) => (
        <div key={r.path} className="route">
          <code className="route-path">{r.path}</code>
          <p className="muted">{r.about}</p>
          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Values</th>
                <th>Default</th>
              </tr>
            </thead>
            <tbody>
              {r.params.map(([name, values, def]) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td>{values}</td>
                  <td>{def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <div className="route">
        <code className="route-path">Live badges</code>
        <p className="muted">
          Values are fetched from GitHub, npm and Codecov and cached for 5 minutes. All of them accept label, size and
          theme.
        </p>
        <table>
          <tbody>
            {LIVE_ROUTES.map(([path, about]) => (
              <tr key={path}>
                <td>
                  <code>{path}</code>
                </td>
                <td>{about}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
