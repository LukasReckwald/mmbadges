const REPO = 'https://github.com/LukasReckwald/mmbadges';

export default function Header() {
  return (
    <header className="topbar">
      <a href="/" className="wordmark">
        <span className="wordmark-pill" aria-hidden="true" />
        mmbadges
      </a>
      <span className="tagline">Badges for Markdown</span>
      <nav className="topnav">
        <a href="#comparison">Comparison</a>
        <a href="#reference">Docs</a>
        <a href={REPO}>GitHub</a>
      </nav>
    </header>
  );
}
