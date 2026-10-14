const ROUTES = [
  {
    path: '/brand/{slug}.svg',
    example: '/brand/react.svg?style=brand',
    params: [
      ['style', 'mono · brand · tint'],
      ['size', 'sm · md · lg'],
      ['theme', 'auto · light · dark'],
      ['label', 'custom text'],
    ],
  },
  {
    path: '/status/{icon}/{label}/{value}.svg',
    example: '/status/lucide:shield-check/coverage/87%25.svg?state=auto',
    params: [
      ['state', 'success · warning · danger · info · neutral · auto'],
      ['size', 'sm · md · lg'],
      ['theme', 'auto · light · dark'],
    ],
  },
];

export default function Usage() {
  return (
    <section id="usage" className="section">
      <h2>Two URLs. That’s the whole API.</h2>
      <p className="section-lead">
        Icons are <code>si:&lt;slug&gt;</code> from Simple Icons or <code>lucide:&lt;name&gt;</code> from Lucide.
        URL-encode special characters – <code>%</code> becomes <code>%25</code>.
      </p>
      <div className="routes">
        {ROUTES.map((r) => (
          <div key={r.path} className="route">
            <code className="route-path">{r.path}</code>
            <dl>
              {r.params.map(([name, values]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{values}</dd>
                </div>
              ))}
            </dl>
            <code className="route-example">{r.example}</code>
          </div>
        ))}
      </div>
    </section>
  );
}
