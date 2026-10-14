import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../worker/index.mjs';
import { formatCount } from '../worker/live.mjs';

// Fake upstream APIs: map URL prefixes to responses (the longest matching prefix wins)
let routes = {};
let requests = [];
vi.stubGlobal('fetch', async (url, init) => {
  requests.push({ url: String(url), headers: init?.headers ?? {} });
  const match = Object.keys(routes)
    .filter((prefix) => String(url).startsWith(prefix))
    .sort((x, y) => y.length - x.length)[0];
  if (!match) return new Response('not found', { status: 404 });
  const r = routes[match];
  if (r instanceof Error) throw r;
  return new Response(JSON.stringify(r.body ?? {}), { status: r.status ?? 200 });
});

// Fake Cloudflare cache (honors nothing but keys – enough for these tests)
const store = new Map();
vi.stubGlobal('caches', {
  default: {
    match: async (req) => store.get(req.url)?.clone(),
    put: async (req, res) => void store.set(req.url, res),
  },
});

const ctx = { waitUntil: (p) => p };
const get = async (path, env = {}) => {
  const res = await worker.fetch(new Request(`https://badges.test${path}`), env, ctx);
  return { res, svg: await res.text() };
};

beforeEach(() => {
  routes = {};
  requests = [];
  store.clear();
});

describe('formatCount', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1k'],
    [1234, '1.2k'],
    [48210, '48.2k'],
    [2500000, '2.5M'],
    [833100000, '833M'],
  ])('%i -> %s', (n, expected) => expect(formatCount(n)).toBe(expected));
});

describe('GitHub Actions', () => {
  const runs = 'https://api.github.com/repos/acme/app/actions/workflows/ci.yml/runs';
  // The default branch is looked up first when no ?branch= is given
  beforeEach(() => {
    routes['https://api.github.com/repos/acme/app'] = { body: { default_branch: 'trunk' } };
  });

  it.each([
    [{ status: 'completed', conclusion: 'success' }, 'passing', '#1a7f37'],
    [{ status: 'completed', conclusion: 'failure' }, 'failing', '#cf222e'],
    [{ status: 'in_progress', conclusion: null }, 'running', '#0969da'],
    [{ status: 'completed', conclusion: 'cancelled' }, 'cancelled', '#1f2328'],
  ])('%o -> %s', async (run, value, color) => {
    routes[runs] = { body: { workflow_runs: [run] } };
    const { svg } = await get('/github/actions/acme/app/ci.yml.svg?theme=light');
    expect(svg).toContain(`aria-label="build: ${value}"`);
    expect(svg).toContain(color);
  });

  it('shows "no runs" for a workflow that never ran', async () => {
    routes[runs] = { body: { workflow_runs: [] } };
    expect((await get('/github/actions/acme/app/ci.yml.svg')).svg).toContain('build: no runs');
  });

  it('passes the branch and the token to GitHub', async () => {
    routes[runs] = { body: { workflow_runs: [] } };
    await get('/github/actions/acme/app/ci.yml.svg?branch=main', { GITHUB_TOKEN: 'secret' });
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toContain('branch=main');
    expect(requests[0].headers.Authorization).toBe('Bearer secret');
  });

  it('uses the default branch when no branch is given', async () => {
    routes[runs] = { body: { workflow_runs: [] } };
    await get('/github/actions/acme/app/ci.yml.svg');
    expect(requests.map((r) => r.url)).toEqual([
      'https://api.github.com/repos/acme/app',
      expect.stringContaining('branch=trunk'),
    ]);
  });

  it('turns an unknown workflow into a 404 badge', async () => {
    routes['https://api.github.com/repos/acme/app/actions/workflows/nope.yml'] = { status: 404 };
    const { res, svg } = await get('/github/actions/acme/app/nope.yml.svg');
    expect(res.status).toBe(404);
    expect(svg).toContain('badge: workflow not found');
  });
});

describe('GitHub repo badges', () => {
  const repo = 'https://api.github.com/repos/acme/app';

  it('formats stars', async () => {
    routes[repo] = { body: { stargazers_count: 2412 } };
    expect((await get('/github/stars/acme/app.svg')).svg).toContain('aria-label="stars: 2.4k"');
  });

  it('reads the SPDX license id', async () => {
    routes[repo] = { body: { license: { spdx_id: 'Apache-2.0' } } };
    expect((await get('/github/license/acme/app.svg')).svg).toContain('license: Apache-2.0');
    routes[repo] = { body: { license: { spdx_id: 'NOASSERTION' } } };
    store.clear();
    expect((await get('/github/license/acme/app.svg')).svg).toContain('license: other');
  });

  it('shows the latest release, or "none"', async () => {
    routes[`${repo}/releases/latest`] = { body: { tag_name: 'v2.1.0' } };
    expect((await get('/github/release/acme/app.svg')).svg).toContain('release: v2.1.0');
    expect((await get('/github/release/acme/other.svg')).svg).toContain('release: none');
  });

  it('accepts a custom label', async () => {
    routes[repo] = { body: { stargazers_count: 5 } };
    expect((await get('/github/stars/acme/app.svg?label=GitHub%20stars')).svg).toContain('GitHub stars: 5');
  });

  it('rejects invalid repo names without calling GitHub', async () => {
    const { res } = await get('/github/stars/acme/a%20b.svg');
    expect(res.status).toBe(404);
    expect(requests).toHaveLength(0);
  });
});

describe('npm', () => {
  it('shows the latest version, also for scoped packages', async () => {
    routes['https://registry.npmjs.org/@acme%2Fui/latest'] = { body: { version: '1.4.2' } };
    expect((await get('/npm/v/@acme/ui.svg')).svg).toContain('aria-label="npm: v1.4.2"');
  });

  it('shows weekly and monthly downloads', async () => {
    routes['https://api.npmjs.org/downloads/point/last-week/left-pad'] = { body: { downloads: 48210 } };
    routes['https://api.npmjs.org/downloads/point/last-month/left-pad'] = { body: { downloads: 210000 } };
    expect((await get('/npm/dw/left-pad.svg')).svg).toContain('downloads: 48.2k/week');
    expect((await get('/npm/dm/left-pad.svg')).svg).toContain('downloads: 210k/month');
  });

  it('turns an unknown package into a 404 badge', async () => {
    expect((await get('/npm/v/does-not-exist.svg')).res.status).toBe(404);
  });
});

describe('Codecov', () => {
  it('colors coverage automatically', async () => {
    routes['https://api.codecov.io/api/v2/github/acme/repos/app/'] = { body: { totals: { coverage: 87.44 } } };
    const { svg } = await get('/codecov/acme/app.svg?theme=light');
    expect(svg).toContain('aria-label="coverage: 87.4%"');
    expect(svg).toContain('#1a7f37');
  });

  it('reads a branch', async () => {
    routes['https://api.codecov.io/api/v2/github/acme/repos/app/branches/dev/'] = {
      body: { head_commit: { totals: { coverage: 51 } } },
    };
    expect((await get('/codecov/acme/app.svg?branch=dev')).svg).toContain('coverage: 51%');
  });
});

describe('caching and fallback', () => {
  const repo = 'https://api.github.com/repos/acme/app';

  it('caches live badges for 5 minutes', async () => {
    routes[repo] = { body: { stargazers_count: 1 } };
    const { res } = await get('/github/stars/acme/app.svg');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=300');
  });

  it('shows the last good value when GitHub is down', async () => {
    routes[repo] = { body: { stargazers_count: 1200 } };
    await get('/github/stars/acme/app.svg', { CF_VERSION_METADATA: { id: 'deploy-1' } });

    // A new deploy (fresh cache) while GitHub fails
    routes[repo] = { status: 500 };
    const { res, svg } = await get('/github/stars/acme/app.svg', { CF_VERSION_METADATA: { id: 'deploy-2' } });
    expect(svg).toContain('stars: 1.2k');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60');
  });

  it('shows an error badge when there is no previous value', async () => {
    routes[repo] = { status: 403 };
    const { res, svg } = await get('/github/stars/acme/app.svg');
    expect(res.status).toBe(502);
    expect(svg).toContain('badge: rate limited');
  });
});
