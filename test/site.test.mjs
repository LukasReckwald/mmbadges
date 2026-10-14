import { describe, it, expect, vi } from 'vitest';
import { brandUrl, statusUrl, snippet } from '../site/src/lib/urls.js';
import { searchBrands } from '../site/src/lib/search.js';
import worker from '../worker/index.mjs';
import { cacheKey } from '../worker/app.mjs';

const BASE = 'https://badges.test';

describe('brandUrl', () => {
  it('leaves out defaults', () => {
    expect(brandUrl(BASE, 'react', { style: 'mono', size: 'md', theme: 'auto', label: '' })).toBe(
      'https://badges.test/brand/react.svg',
    );
  });

  it('sorts parameters like the worker cache key', () => {
    const url = brandUrl(BASE, 'react', { theme: 'dark', style: 'brand', size: 'lg' });
    expect(url).toBe(cacheKey(new URL(url)));
  });

  it('encodes labels', () => {
    expect(brandUrl(BASE, 'nextdotjs', { label: 'Next.js & co' })).toBe(
      'https://badges.test/brand/nextdotjs.svg?label=Next.js+%26+co',
    );
  });
});

describe('statusUrl', () => {
  it('encodes path segments but keeps the icon colon readable', () => {
    expect(statusUrl(BASE, { icon: 'lucide:shield-check', label: 'coverage', value: '87%' }, { state: 'auto' })).toBe(
      'https://badges.test/status/lucide:shield-check/coverage/87%25.svg?state=auto',
    );
  });

  it('produces URLs the worker understands', async () => {
    vi.stubGlobal('caches', { default: { match: async () => undefined, put: async () => {} } });
    const url = statusUrl(BASE, { icon: 'si:npm', label: 'downloads', value: '12k / month' }, { state: 'info' });
    const res = await worker.fetch(new Request(url), {}, { waitUntil: () => {} });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('aria-label="downloads: 12k / month"');
  });
});

describe('snippet', () => {
  const urlFor = (theme) => `${BASE}/brand/react.svg?theme=${theme}`;

  it('markdown uses the selected theme', () => {
    expect(snippet('markdown', 'React', urlFor, 'auto')).toBe(
      '![React](https://badges.test/brand/react.svg?theme=auto)',
    );
  });

  it('html uses fixed light and dark URLs', () => {
    const html = snippet('html', 'React', urlFor, 'auto');
    expect(html).toContain('srcset="https://badges.test/brand/react.svg?theme=dark"');
    expect(html).toContain('src="https://badges.test/brand/react.svg?theme=light"');
  });

  it('escapes alt text', () => {
    expect(snippet('markdown', 'a [b]', urlFor, 'auto')).toMatch(/^!\[a \\\[b\\\]\]/);
    expect(snippet('html', 'a "b"', urlFor, 'auto')).toContain('alt="a &quot;b&quot;"');
  });
});

describe('searchBrands', () => {
  const brands = [
    ['nextdotjs', 'Next.js'],
    ['preact', 'Preact'],
    ['react', 'React'],
    ['reactrouter', 'React Router'],
  ];

  it('returns everything for an empty query', () => {
    expect(searchBrands(brands, '  ')).toBe(brands);
  });

  it('ranks exact, then prefix, then substring matches', () => {
    expect(searchBrands(brands, 'react').map(([s]) => s)).toEqual(['react', 'reactrouter', 'preact']);
  });

  it('ignores case and punctuation', () => {
    expect(searchBrands(brands, 'NEXT.JS').map(([s]) => s)).toEqual(['nextdotjs']);
  });
});
