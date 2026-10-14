const FEATURES = [
  {
    title: 'Light and dark in one URL',
    text: 'Every badge carries both palettes and switches with the viewer’s color scheme. No <picture> juggling needed.',
  },
  {
    title: 'Readable by design',
    text: 'Brand colors are adjusted until they meet WCAG contrast on both backgrounds – even yellow on white.',
  },
  {
    title: '3000+ real logos',
    text: 'Every logo from Simple Icons, plus 1800+ Lucide line icons for status badges.',
  },
  {
    title: 'Free and open source',
    text: 'MIT licensed, no tracking, no account. Badges are cached at the edge and load fast everywhere.',
  },
];

export default function Features() {
  return (
    <section className="section">
      <div className="features">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature">
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
