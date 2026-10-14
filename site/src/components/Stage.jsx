const HEIGHT = { sm: 20, md: 24, lg: 28 };
const ZOOM = 2; // SVGs stay sharp at any size

// Large preview on a surface that is half light, half dark.
// With theme=auto each half uses the matching fixed theme, so both variants are visible.
export default function Stage({ urlFor, theme, size, alt }) {
  const height = HEIGHT[size] * ZOOM;
  return (
    <div className="stage">
      {['light', 'dark'].map((half) => (
        <div key={half} className={`stage-half stage-${half}`}>
          <img src={urlFor(theme === 'auto' ? half : theme)} alt={alt} style={{ height }} />
          <span className="stage-label">{half}</span>
        </div>
      ))}
    </div>
  );
}
