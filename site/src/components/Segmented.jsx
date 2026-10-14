// A row of mutually exclusive buttons (like a radio group), e.g. mono | brand | tint
export default function Segmented({ label, value, options, onChange, className = '' }) {
  return (
    <div className={`field ${className}`}>
      <span className="field-label">{label}</span>
      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            className={value === opt ? 'active' : ''}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
