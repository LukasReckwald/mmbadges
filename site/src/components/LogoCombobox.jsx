import { useDeferredValue, useId, useMemo, useRef, useState } from 'react';
import brands from '../generated/brands.json';
import { BASE } from '../lib/base.js';
import { searchBrands } from '../lib/search.js';
import { brandUrl } from '../lib/urls.js';

const MAX_RESULTS = 8;

// Search field with a dropdown of matching logos (ARIA combobox pattern):
// ↑/↓ move the highlight, Enter picks, Escape closes.
export default function LogoCombobox({ selected, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef(null);
  const listId = useId();

  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => searchBrands(brands, deferredQuery).slice(0, MAX_RESULTS), [deferredQuery]);

  function pick(brand) {
    onSelect(brand);
    setQuery('');
    setOpen(false);
    input.current?.blur();
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showList = open && query.trim() !== '';

  return (
    <div className="combobox">
      <svg className="combobox-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={input}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active][0]}` : undefined}
        aria-label="Search logos"
        placeholder={`Search ${brands.length.toLocaleString('en')} logos – currently ${selected[1]}`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul id={listId} role="listbox" className="combobox-list">
          {results.length === 0 && <li className="combobox-empty">No logo found</li>}
          {results.map((brand, i) => (
            <li
              key={brand[0]}
              id={`${listId}-${brand[0]}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onMouseEnter={() => setActive(i)}
              // Keep focus in the input, otherwise its blur closes the list before the click lands
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(brand)}
            >
              <img src={brandUrl(BASE, brand[0], { size: 'sm' })} alt="" />
              <span className="combobox-slug">{brand[0]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
