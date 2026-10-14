import { useState } from 'react';
import { BASE } from '../lib/base.js';
import { LIVE_SOURCES, brandUrl, liveUrl, statusUrl } from '../lib/urls.js';
import { useDebounced } from '../lib/useDebounced.js';
import BrandPanel from './BrandPanel.jsx';
import LivePanel, { LIVE_DEFAULTS } from './LivePanel.jsx';
import Segmented from './Segmented.jsx';
import SnippetBar from './SnippetBar.jsx';
import Stage from './Stage.jsx';
import StatusPanel, { PRESETS } from './StatusPanel.jsx';

const TABS = [
  { id: 'brand', title: 'Brand' },
  { id: 'status', title: 'Status' },
  { id: 'live', title: 'Live' },
];

// The main tool: pick a badge type, configure it, preview it, copy the snippet.
// Each tab keeps its own state, so switching tabs doesn't lose your settings.
// "?tab=status" opens a tab directly, so links can point to it.
const initialTab = () => {
  const t = new URLSearchParams(location.search).get('tab');
  return TABS.some((x) => x.id === t && !x.soon) ? t : 'brand';
};

export default function Builder() {
  const [tab, setTab] = useState(initialTab);
  const [brand, setBrand] = useState({ brand: ['react', 'React'], style: 'brand', label: '' });
  const [status, setStatus] = useState(PRESETS[0]);
  const [live, setLive] = useState(LIVE_DEFAULTS);
  const [opts, setOpts] = useState({ size: 'md', theme: 'auto' });

  // Text inputs are debounced so the preview doesn't fetch a badge per keystroke
  const b = useDebounced(brand);
  const s = useDebounced(status);
  // Live badges call GitHub/npm/Codecov, so wait a little longer while typing
  const l = useDebounced(live, 600);

  const badges = {
    brand: {
      alt: brand.label || brand.brand[1],
      urlFor: (theme) => brandUrl(BASE, b.brand[0], { ...opts, theme, style: b.style, label: b.label }),
    },
    status: {
      alt: `${status.label}: ${status.value}`,
      urlFor: (theme) => statusUrl(BASE, s, { ...opts, theme, state: s.state }),
    },
    live: {
      alt: live.label || LIVE_SOURCES[live.source].title,
      urlFor: (theme) => liveUrl(BASE, l.source, l, { ...opts, theme, label: l.label }),
    },
  };
  const badge = badges[tab];

  const set = (key) => (value) => setOpts((o) => ({ ...o, [key]: value }));

  return (
    <section id="builder" className="workspace" aria-label="Badge builder">
      <aside className="sidebar">
        <div className="tabs" role="tablist" aria-label="Badge type">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              disabled={t.soon}
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.title}
              {t.soon && <span className="soon">soon</span>}
            </button>
          ))}
        </div>

        {tab === 'brand' && <BrandPanel state={brand} setState={setBrand} />}
        {tab === 'status' && <StatusPanel state={status} setState={setStatus} />}
        {tab === 'live' && <LivePanel state={live} setState={setLive} />}

        <div className="controls">
          <Segmented label="Size" value={opts.size} options={['sm', 'md', 'lg']} onChange={set('size')} />
          <Segmented label="Theme" value={opts.theme} options={['auto', 'light', 'dark']} onChange={set('theme')} />
        </div>
      </aside>

      <div className="output">
        <Stage urlFor={badge.urlFor} theme={opts.theme} size={opts.size} alt={badge.alt} />
        <SnippetBar alt={badge.alt} urlFor={badge.urlFor} theme={opts.theme} />
      </div>
    </section>
  );
}
