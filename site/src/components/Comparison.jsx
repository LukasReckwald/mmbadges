import { BASE } from '../lib/base.js';
import { brandUrl, statusUrl } from '../lib/urls.js';

// Local copies of shields.io badges, see site/scripts/fetch-comparison.mjs
const SHIELDS = '/compare';

// The same information from shields.io – in the styles people commonly use: "for-the-badge"
// for technology logos, the default "flat" for status badges – and from mmbadges
const ROWS = [
  {
    name: 'React',
    shields: `${SHIELDS}/react.svg`,
    mm: brandUrl(BASE, 'react', { style: 'brand' }),
  },
  {
    name: 'TypeScript',
    shields: `${SHIELDS}/typescript.svg`,
    mm: brandUrl(BASE, 'typescript', { style: 'brand' }),
  },
  {
    name: 'Docker',
    shields: `${SHIELDS}/docker.svg`,
    mm: brandUrl(BASE, 'docker', { style: 'brand' }),
  },
  {
    name: 'build: passing',
    shields: `${SHIELDS}/build.svg`,
    mm: statusUrl(BASE, { icon: 'si:githubactions', label: 'build', value: 'passing' }, { state: 'success' }),
  },
  {
    name: 'coverage: 94%',
    shields: `${SHIELDS}/coverage.svg`,
    mm: statusUrl(BASE, { icon: 'lucide:shield-check', label: 'coverage', value: '94%' }, { state: 'auto' }),
  },
  {
    name: 'license: MIT',
    shields: `${SHIELDS}/license.svg`,
    mm: statusUrl(BASE, { icon: 'lucide:scale', label: 'license', value: 'MIT' }),
  },
];

export default function Comparison() {
  return (
    <section id="comparison" className="comparison">
      <h2>Comparison</h2>
      <p className="muted">
        The same badges from <a href="https://shields.io">shields.io</a>, in the styles they are most often used in
        (for-the-badge for logos, the default flat style for status), and from mmbadges. shields.io has many more badge
        types and integrations; mmbadges focuses on a different look and automatic dark mode.
      </p>
      <table>
        <thead>
          <tr>
            <th>Badge</th>
            <th>shields.io</th>
            <th>mmbadges</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.name}>
              <td className="muted">{r.name}</td>
              <td>
                <img src={r.shields} alt={`${r.name} (shields.io)`} loading="lazy" />
              </td>
              <td>
                <img src={r.mm} alt={`${r.name} (mmbadges)`} loading="lazy" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
