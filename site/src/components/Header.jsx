const REPO = 'https://github.com/LukasReckwald/mmbadges';

export default function Header() {
  return (
    <div className="topbar">
      <a href="/" className="wordmark" aria-label="mmbadges home">
        <span className="wordmark-pill" aria-hidden="true" />
        mmbadges
      </a>
      <nav className="topnav">
        <a href="#compare">Compare</a>
        <a href="#usage">Docs</a>
        <a href={REPO}>GitHub</a>
      </nav>
    </div>
  );
}
