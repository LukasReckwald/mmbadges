// Shows a badge on a light and a dark tile side by side.
// With theme=auto each tile uses the matching fixed theme, so both variants are visible
// no matter which color scheme the page itself uses.
export default function Preview({ urlFor, theme, alt }) {
  const themeFor = (tile) => (theme === 'auto' ? tile : theme);
  return (
    <div className="preview">
      {['light', 'dark'].map((tile) => (
        <div key={tile} className={`tile tile-${tile}`}>
          <img src={urlFor(themeFor(tile))} alt={alt} />
          <span className="tile-label">{tile}</span>
        </div>
      ))}
    </div>
  );
}
