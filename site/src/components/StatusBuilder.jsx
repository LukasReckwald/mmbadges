import { useState } from 'react';
import brands from '../generated/brands.json';
import lucideNames from '../generated/lucide.json';
import { BASE } from '../lib/base.js';
import { statusUrl } from '../lib/urls.js';
import { useDebounced } from '../lib/useDebounced.js';
import CopySnippet from './CopySnippet.jsx';
import Preview from './Preview.jsx';
import Segmented from './Segmented.jsx';

const PRESETS = [
  { name: 'Build', icon: 'si:githubactions', label: 'build', value: 'passing', state: 'success' },
  { name: 'Coverage', icon: 'lucide:shield-check', label: 'coverage', value: '87%', state: 'auto' },
  { name: 'Tests', icon: 'lucide:test-tube', label: 'tests', value: '248 passed', state: 'success' },
  { name: 'Version', icon: 'lucide:tag', label: 'version', value: 'v1.4.2', state: 'info' },
  { name: 'License', icon: 'lucide:scale', label: 'license', value: 'MIT', state: 'neutral' },
  { name: 'Downloads', icon: 'si:npm', label: 'downloads', value: '12k/month', state: 'neutral' },
];

const SOURCES = {
  lucide: { title: 'Lucide', names: lucideNames, link: 'https://lucide.dev/icons' },
  si: { title: 'Simple Icons', names: brands.map(([slug]) => slug), link: 'https://simpleicons.org' },
};

export default function StatusBuilder() {
  const [badge, setBadge] = useState(PRESETS[0]);
  const [opts, setOpts] = useState({ size: 'md', theme: 'auto' });
  const [source, name] = badge.icon.split(':');

  const update = (patch) => setBadge((b) => ({ ...b, ...patch }));
  const set = (key) => (value) => setOpts((o) => ({ ...o, [key]: value }));

  // Text fields are debounced so the preview doesn't fetch a badge per keystroke
  const debounced = useDebounced(badge);
  const urlFor = (theme) => statusUrl(BASE, debounced, { ...opts, theme, state: debounced.state });
  const alt = `${badge.label}: ${badge.value}`;

  return (
    <section id="status" className="section">
      <h2>Status badges</h2>
      <div className="card builder">
        <div className="presets">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className={badge.label === p.label && badge.icon === p.icon ? 'active' : ''}
              onClick={() => setBadge(p)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="form">
          <div className="field">
            <span className="field-label">Icon</span>
            <div className="icon-input">
              <select
                value={source}
                aria-label="Icon source"
                onChange={(e) => update({ icon: `${e.target.value}:${e.target.value === 'si' ? 'github' : 'star'}` })}
              >
                {Object.entries(SOURCES).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.title}
                  </option>
                ))}
              </select>
              <input
                list={`icons-${source}`}
                value={name}
                aria-label="Icon name"
                onChange={(e) => update({ icon: `${source}:${e.target.value.trim().toLowerCase()}` })}
              />
              <datalist id={`icons-${source}`}>
                {SOURCES[source].names.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>
            <a className="hint" href={SOURCES[source].link} target="_blank" rel="noreferrer">
              Browse {SOURCES[source].title} names ↗
            </a>
          </div>
          <label className="field">
            <span className="field-label">Label</span>
            <input value={badge.label} maxLength={64} onChange={(e) => update({ label: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">Value</span>
            <input value={badge.value} maxLength={64} onChange={(e) => update({ value: e.target.value })} />
          </label>
        </div>

        <div className="options">
          <Segmented
            label="State"
            value={badge.state}
            options={['success', 'warning', 'danger', 'info', 'neutral', 'auto']}
            onChange={(state) => update({ state })}
          />
          <Segmented label="Size" value={opts.size} options={['sm', 'md', 'lg']} onChange={set('size')} />
          <Segmented label="Theme" value={opts.theme} options={['auto', 'light', 'dark']} onChange={set('theme')} />
        </div>
        {badge.state === 'auto' && <p className="hint">auto: ≥ 80 % green, ≥ 60 % yellow, otherwise red.</p>}

        <Preview urlFor={urlFor} theme={opts.theme} alt={alt} />
        <CopySnippet alt={alt} urlFor={urlFor} theme={opts.theme} />
        <p className="hint">
          These values are static. Live badges that read your real CI status, stars or npm version are coming next.
        </p>
      </div>
    </section>
  );
}
