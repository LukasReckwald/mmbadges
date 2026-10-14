import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../worker/index.mjs';
import { cacheKey } from '../worker/app.mjs';

// Node has no Cloudflare Cache API, so we use a tiny stand-in
const store = new Map();
vi.stubGlobal('caches', {
  default: {
    match: async (req) => store.get(req.url)?.clone(),
    put: async (req, res) => void store.set(req.url, res),
  },
});
const ctx = { waitUntil: (p) => p };
const get = (path) => worker.fetch(new Request(`https://badges.test${path}`), {}, ctx);

beforeEach(() => store.clear());

describe('worker', () => {
  it('serves a brand badge as SVG', async () => {
    const res = await get('/brand/react.svg');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml; charset=utf-8');
    expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'none'");
    const svg = await res.text();
    expect(svg).toContain('aria-label="React"');
    expect(svg).toContain('prefers-color-scheme:dark'); // auto is the default
  });

  it('respects theme, style and label', async () => {
    const svg = await (await get('/brand/nextdotjs.svg?theme=dark&style=tint&label=Next')).text();
    expect(svg).toContain('aria-label="Next"');
    expect(svg).not.toContain('<style>');
  });

  it('serves status badges with decoded values', async () => {
    const res = await get('/status/lucide:shield-check/coverage/87%25.svg?state=auto&theme=light');
    expect(res.status).toBe(200);
    const svg = await res.text();
    expect(svg).toContain('aria-label="coverage: 87%"');
    expect(svg).toContain('#1a7f37'); // >= 80 % is green
  });

  it.each([
    ['/brand/doesnotexist.svg', 404, 'unknown logo'],
    ['/status/lucide:nope/build/passing.svg', 404, 'unknown icon'],
    ['/brand/react.svg?theme=pink', 400, 'invalid theme'],
    ['/brand/react.svg?label=' + 'x'.repeat(65), 400, 'label too long'],
    ['/whatever.svg', 404, 'not found'],
    ['/brand/react.png', 404, 'not found'],
    ['/status/si:npm/%E0%A4%A/x.svg', 400, 'bad url'],
  ])('%s -> %i as error SVG', async (path, status, message) => {
    const res = await get(path);
    expect(res.status).toBe(status);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');
    expect(await res.text()).toContain(`badge: ${message}`);
  });

  it('caches successful responses but not errors', async () => {
    await get('/brand/react.svg');
    await get('/brand/doesnotexist.svg');
    expect([...store.keys()]).toEqual(['https://badges.test/brand/react.svg']);
  });

  it('rejects POST', async () => {
    const res = await worker.fetch(new Request('https://badges.test/brand/react.svg', { method: 'POST' }), {}, ctx);
    expect(res.status).toBe(405);
  });
});

describe('cacheKey', () => {
  it('sorts parameters and drops defaults', () => {
    const a = cacheKey(new URL('https://x.test/brand/react.svg?size=md&theme=auto&style=brand&utm=1'));
    const b = cacheKey(new URL('https://x.test/brand/react.svg?style=brand'));
    expect(a).toBe(b);
    expect(a).toBe('https://x.test/brand/react.svg?style=brand');
  });
});
