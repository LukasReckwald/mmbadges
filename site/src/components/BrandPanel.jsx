import { BASE } from '../lib/base.js';
import { brandUrl } from '../lib/urls.js';
import LogoCombobox from './LogoCombobox.jsx';
import Segmented from './Segmented.jsx';

// Quick picks under the search field
const POPULAR = [
  ['react', 'React'],
  ['typescript', 'TypeScript'],
  ['python', 'Python'],
  ['rust', 'Rust'],
  ['go', 'Go'],
  ['nextdotjs', 'Next.js'],
  ['tailwindcss', 'Tailwind CSS'],
  ['docker', 'Docker'],
  ['postgresql', 'PostgreSQL'],
  ['figma', 'Figma'],
];

export default function BrandPanel({ state, setState }) {
  const set = (key) => (value) => setState((s) => ({ ...s, [key]: value }));
  const select = (brand) => setState((s) => ({ ...s, brand, label: '' }));

  return (
    <div className="panel">
      <LogoCombobox selected={state.brand} onSelect={select} />
      <div className="popular" aria-label="Popular logos">
        {POPULAR.map((brand) => (
          <button
            key={brand[0]}
            type="button"
            className={brand[0] === state.brand[0] ? 'active' : ''}
            onClick={() => select(brand)}
            title={brand[1]}
          >
            <img src={brandUrl(BASE, brand[0], { size: 'sm' })} alt={brand[1]} />
          </button>
        ))}
      </div>
      <div className="controls">
        <Segmented label="Style" value={state.style} options={['mono', 'brand', 'tint']} onChange={set('style')} />
        <label className="field">
          <span className="field-label">Label</span>
          <input
            value={state.label}
            placeholder={state.brand[1]}
            maxLength={64}
            onChange={(e) => set('label')(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
