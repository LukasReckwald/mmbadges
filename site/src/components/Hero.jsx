import { BASE } from '../lib/base.js';
import { brandUrl, statusUrl } from '../lib/urls.js';

// The classic look, loaded from shields.io for comparison
const BEFORE = [
  ['React', 'https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB'],
  [
    'TypeScript',
    'https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white',
  ],
  ['Docker', 'https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white'],
  ['build: passing', 'https://img.shields.io/badge/build-passing-brightgreen'],
  ['coverage: 94%', 'https://img.shields.io/badge/coverage-94%25-brightgreen'],
];

const AFTER = [
  ['React', brandUrl(BASE, 'react', { style: 'brand' })],
  ['TypeScript', brandUrl(BASE, 'typescript', { style: 'brand' })],
  ['Docker', brandUrl(BASE, 'docker', { style: 'brand' })],
  [
    'build: passing',
    statusUrl(BASE, { icon: 'si:githubactions', label: 'build', value: 'passing' }, { state: 'success' }),
  ],
  [
    'coverage: 94%',
    statusUrl(BASE, { icon: 'lucide:shield-check', label: 'coverage', value: '94%' }, { state: 'auto' }),
  ],
];

const Row = ({ label, badges }) => (
  <div className="compare-row">
    <span className="compare-label">{label}</span>
    <div className="badges">
      {badges.map(([alt, src]) => (
        <img key={alt} src={src} alt={alt} />
      ))}
    </div>
  </div>
);

export default function Hero() {
  return (
    <header className="hero">
      <h1>README badges that don’t look like 2014.</h1>
      <p className="lead">
        Clean pills, 3000+ real brand logos and automatic light and dark mode – from a single URL. Free and open source.
      </p>
      <div className="compare">
        <Row label="Before" badges={BEFORE} />
        <Row label="mmbadges" badges={AFTER} />
      </div>
      <nav className="hero-links">
        <a href="#brands">Browse logos</a>
        <a href="#status">Build a status badge</a>
        <a href="https://github.com/LukasReckwald/mmbadges">GitHub</a>
      </nav>
    </header>
  );
}
