import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import brands from '../generated/brands.json';
import { BASE } from '../lib/base.js';
import { searchBrands } from '../lib/search.js';
import { brandUrl } from '../lib/urls.js';
import { useDebounced } from '../lib/useDebounced.js';
import CopySnippet from './CopySnippet.jsx';
import Preview from './Preview.jsx';
import Segmented from './Segmented.jsx';

const PAGE = 96; // badges rendered at once; more are added while scrolling

export default function BrandGallery() {
  const [query, setQuery] = useState('');
  const [opts, setOpts] = useState({ style: 'mono', size: 'md', theme: 'auto' });
  const [selected, setSelected] = useState(['react', 'React']);
  const [label, setLabel] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const sentinel = useRef(null);
  const builder = useRef(null);

  // useDeferredValue keeps typing smooth: filtering 3400 entries may lag behind a keystroke
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => searchBrands(brands, deferredQuery), [deferredQuery]);

  // Start at the top of the list again for every new search
  useEffect(() => setLimit(PAGE), [deferredQuery]);

  // Infinite scroll: when the invisible element below the grid becomes visible, show more
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setLimit((n) => n + PAGE);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const set = (key) => (value) => setOpts((o) => ({ ...o, [key]: value }));
  const [slug, title] = selected;
  const debouncedLabel = useDebounced(label);
  const urlFor = (theme) => brandUrl(BASE, slug, { ...opts, theme, label: debouncedLabel });

  function select(brand) {
    setSelected(brand);
    setLabel('');
    builder.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section id="brands" className="section">
      <h2>Brand badges</h2>

      <div ref={builder} className="card builder">
        <div className="builder-head">
          <div>
            <h3>{label || title}</h3>
            <code className="muted">{slug}</code>
          </div>
          <label className="field">
            <span className="field-label">Label</span>
            <input value={label} placeholder={title} maxLength={64} onChange={(e) => setLabel(e.target.value)} />
          </label>
        </div>
        <div className="options">
          <Segmented label="Style" value={opts.style} options={['mono', 'brand', 'tint']} onChange={set('style')} />
          <Segmented label="Size" value={opts.size} options={['sm', 'md', 'lg']} onChange={set('size')} />
          <Segmented label="Theme" value={opts.theme} options={['auto', 'light', 'dark']} onChange={set('theme')} />
        </div>
        <Preview urlFor={urlFor} theme={opts.theme} alt={label || title} />
        <CopySnippet alt={label || title} urlFor={urlFor} theme={opts.theme} />
      </div>

      <input
        className="search"
        type="search"
        value={query}
        placeholder={`Search ${brands.length.toLocaleString('en')} logos…`}
        aria-label="Search logos"
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className="muted count">
        {results.length.toLocaleString('en')} {results.length === 1 ? 'logo' : 'logos'}
      </p>

      <div className="grid">
        {results.slice(0, limit).map((brand) => (
          <button
            key={brand[0]}
            type="button"
            className={`grid-item ${brand[0] === slug ? 'active' : ''}`}
            title={brand[1]}
            onClick={() => select(brand)}
          >
            <img src={brandUrl(BASE, brand[0], opts)} alt={brand[1]} loading="lazy" />
          </button>
        ))}
      </div>
      {results.length === 0 && <p className="muted">No logo found. Simple Icons might not have it yet.</p>}
      <div ref={sentinel} className="sentinel" />
    </section>
  );
}
