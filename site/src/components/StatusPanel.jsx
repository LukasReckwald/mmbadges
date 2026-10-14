import brands from '../generated/brands.json';
import lucideNames from '../generated/lucide.json';
import Segmented from './Segmented.jsx';

export const PRESETS = [
  { name: 'Build', icon: 'si:githubactions', label: 'build', value: 'passing', state: 'success' },
  { name: 'Coverage', icon: 'lucide:shield-check', label: 'coverage', value: '87%', state: 'auto' },
  { name: 'Tests', icon: 'lucide:test-tube', label: 'tests', value: '248 passed', state: 'success' },
  { name: 'Version', icon: 'lucide:tag', label: 'version', value: 'v1.4.2', state: 'info' },
  { name: 'License', icon: 'lucide:scale', label: 'license', value: 'MIT', state: 'neutral' },
  { name: 'Downloads', icon: 'si:npm', label: 'downloads', value: '12k/month', state: 'neutral' },
];

const SOURCES = {
  lucide: { title: 'Lucide', names: lucideNames, fallback: 'star', link: 'https://lucide.dev/icons' },
  si: {
    title: 'Simple Icons',
    names: brands.map(([slug]) => slug),
    fallback: 'github',
    link: 'https://simpleicons.org',
  },
};

export default function StatusPanel({ state, setState }) {
  const update = (patch) => setState((s) => ({ ...s, ...patch }));
  const [source, name] = state.icon.split(':');

  return (
    <div className="panel">
      <div className="presets" aria-label="Presets">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            className={state.label === p.label && state.icon === p.icon ? 'active' : ''}
            onClick={() => setState(p)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="controls">
        <div className="field">
          <span className="field-label">
            Icon ·{' '}
            <a href={SOURCES[source].link} target="_blank" rel="noreferrer">
              browse ↗
            </a>
          </span>
          <div className="icon-input">
            <select
              value={source}
              aria-label="Icon source"
              onChange={(e) => update({ icon: `${e.target.value}:${SOURCES[e.target.value].fallback}` })}
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
        </div>
        <label className="field">
          <span className="field-label">Label</span>
          <input value={state.label} maxLength={64} onChange={(e) => update({ label: e.target.value })} />
        </label>
        <label className="field">
          <span className="field-label">Value</span>
          <input value={state.value} maxLength={64} onChange={(e) => update({ value: e.target.value })} />
        </label>
      </div>
      <Segmented
        className="states"
        label={state.state === 'auto' ? 'State · auto: ≥ 80 % green, ≥ 60 % yellow, else red' : 'State'}
        value={state.state}
        options={['success', 'warning', 'danger', 'info', 'neutral', 'auto']}
        onChange={(s) => update({ state: s })}
      />
    </div>
  );
}
