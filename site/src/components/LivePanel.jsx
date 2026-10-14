import { LIVE_SOURCES } from '../lib/urls.js';
import Segmented from './Segmented.jsx';

export const LIVE_DEFAULTS = {
  source: 'actions',
  repo: 'vitejs/vite',
  workflow: 'ci.yml',
  branch: '',
  pkg: 'vite',
  period: 'week',
  label: '',
};

const HINTS = {
  actions:
    'Status of the latest run of a workflow file in .github/workflows. Uses the default branch unless you set one.',
  stars: 'Star count of a public repository.',
  release: 'Tag of the latest GitHub release.',
  license: 'License detected by GitHub.',
  npm: 'Latest version on the npm registry. Scoped packages work too: @scope/name.',
  downloads: 'Downloads from the npm registry.',
  codecov: 'Coverage from Codecov – the repository has to upload its reports there.',
};

// Values are fetched live and cached for 5 minutes
export default function LivePanel({ state, setState }) {
  const set = (key) => (value) => setState((s) => ({ ...s, [key]: value }));
  const input = (key) => (e) => set(key)(e.target.value);
  const fields = LIVE_SOURCES[state.source].fields;

  return (
    <div className="panel">
      <div className="presets" aria-label="Live badge type">
        {Object.entries(LIVE_SOURCES).map(([key, s]) => (
          <button
            key={key}
            type="button"
            className={state.source === key ? 'active' : ''}
            onClick={() => set('source')(key)}
          >
            {s.title}
          </button>
        ))}
      </div>
      <p className="hint">{HINTS[state.source]}</p>

      <div className="controls">
        {fields.includes('repo') && (
          <label className="field">
            <span className="field-label">Repository</span>
            <input value={state.repo} placeholder="owner/name" onChange={input('repo')} />
          </label>
        )}
        {fields.includes('workflow') && (
          <label className="field">
            <span className="field-label">Workflow file</span>
            <input value={state.workflow} placeholder="ci.yml" onChange={input('workflow')} />
          </label>
        )}
        {fields.includes('branch') && (
          <label className="field">
            <span className="field-label">Branch (optional)</span>
            <input value={state.branch} placeholder="default branch" onChange={input('branch')} />
          </label>
        )}
        {fields.includes('pkg') && (
          <label className="field">
            <span className="field-label">Package</span>
            <input value={state.pkg} placeholder="name or @scope/name" onChange={input('pkg')} />
          </label>
        )}
        {fields.includes('period') && (
          <Segmented label="Period" value={state.period} options={['week', 'month']} onChange={set('period')} />
        )}
        <label className="field">
          <span className="field-label">Label (optional)</span>
          <input value={state.label} maxLength={64} placeholder="default" onChange={input('label')} />
        </label>
      </div>
    </div>
  );
}
