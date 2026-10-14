import { BASE } from '../lib/base.js';
import { brandUrl, statusUrl } from '../lib/urls.js';

const SHIELDS = 'https://img.shields.io/badge';

// The same information, rendered by shields.io (default "flat" style) and by mmbadges
const ROWS = [
  {
    name: 'React',
    shields: `${SHIELDS}/React-20232A?logo=react&logoColor=61DAFB`,
    mm: brandUrl(BASE, 'react', { style: 'brand' }),
  },
  {
    name: 'TypeScript',
    shields: `${SHIELDS}/TypeScript-3178C6?logo=typescript&logoColor=white`,
    mm: brandUrl(BASE, 'typescript', { style: 'brand' }),
  },
  {
    name: 'Docker',
    shields: `${SHIELDS}/Docker-2496ED?logo=docker&logoColor=white`,
    mm: brandUrl(BASE, 'docker', { style: 'brand' }),
  },
  {
    name: 'build: passing',
    shields: `${SHIELDS}/build-passing-brightgreen?logo=githubactions&logoColor=white`,
    mm: statusUrl(BASE, { icon: 'si:githubactions', label: 'build', value: 'passing' }, { state: 'success' }),
  },
  {
    name: 'coverage: 94%',
    shields: `${SHIELDS}/coverage-94%25-brightgreen`,
    mm: statusUrl(BASE, { icon: 'lucide:shield-check', label: 'coverage', value: '94%' }, { state: 'auto' }),
  },
  {
    name: 'license: MIT',
    shields: `${SHIELDS}/license-MIT-blue`,
    mm: statusUrl(BASE, { icon: 'lucide:scale', label: 'license', value: 'MIT' }),
  },
];

export default function Comparison() {
  return (
    <section id="comparison" className="comparison">
      <h2>Comparison</h2>
      <p className="muted">
        The same badges from <a href="https://shields.io">shields.io</a> in its default style and from mmbadges.
        shields.io has many more badge types and integrations; mmbadges focuses on a different look and automatic dark
        mode.
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
