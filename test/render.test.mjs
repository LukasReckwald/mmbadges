import { describe, it, expect } from 'vitest';
import { renderBrand, STYLES } from '../src/brands.mjs';
import { renderStatus, resolveState } from '../src/status.mjs';
import { brandIcon, resolveIcon } from '../src/icons.mjs';

// All hex colors in an SVG string, in order
const hexes = (s) => s.match(/#[0-9a-fA-F]{6}/g);
// The light or dark part of the <style> block
const lightCss = (svg) => svg.match(/<style>(.*)@media/)[1];
const darkCss = (svg) => svg.match(/prefers-color-scheme:dark\)\{(.*)\}<\/style>/)[1];

describe('resolveState', () => {
  it.each([
    ['80%', 'success'],
    ['79.9%', 'warning'],
    ['60', 'warning'],
    ['59.9%', 'danger'],
    ['n/a', 'neutral'],
  ])('auto %s -> %s', (value, expected) => {
    expect(resolveState('auto', value)).toBe(expected);
  });

  it('keeps fixed states unchanged', () => {
    expect(resolveState('info', '12%')).toBe('info');
  });
});

describe('renderBrand', () => {
  const icon = brandIcon('react');

  for (const style of STYLES) {
    for (const theme of ['light', 'dark', 'auto']) {
      it(`${style}/${theme} matches snapshot`, () => {
        expect(renderBrand({ icon, theme, style })).toMatchSnapshot();
      });
    }

    it(`${style}/auto contains exactly the light and dark colors`, () => {
      const auto = renderBrand({ icon, theme: 'auto', style });
      const light = renderBrand({ icon, theme: 'light', style });
      const dark = renderBrand({ icon, theme: 'dark', style });
      expect(hexes(lightCss(auto))).toEqual(hexes(light));
      expect(hexes(darkCss(auto))).toEqual(hexes(dark));
    });
  }

  it('escapes labels', () => {
    expect(renderBrand({ icon, label: '<b>&"' })).toContain('&lt;b&gt;&amp;&quot;');
  });
});

describe('renderStatus', () => {
  it.each([
    ['si:githubactions', 'build', 'passing', 'success'],
    ['lucide:shield-check', 'coverage', '67%', 'auto'],
  ])('%s %s=%s (%s) matches snapshot', (spec, label, value, state) => {
    const icon = resolveIcon(spec);
    for (const theme of ['light', 'dark', 'auto'])
      expect(renderStatus({ icon, label, value, state, theme })).toMatchSnapshot();
  });

  it('auto contains the state colors for light and dark', () => {
    const svg = renderStatus({ icon: resolveIcon('lucide:tag'), label: 'version', value: 'v1', state: 'info' });
    expect(lightCss(svg)).toContain('#0969da');
    expect(darkCss(svg)).toContain('#4493f8');
  });
});

describe('resolveIcon', () => {
  it('resolves Simple Icons and Lucide', () => {
    expect(resolveIcon('si:github').type).toBe('si');
    expect(resolveIcon('lucide:a-large-small').type).toBe('lucide');
  });

  it('returns null for unknown icons', () => {
    expect(resolveIcon('si:doesnotexist')).toBeNull();
    expect(resolveIcon('lucide:doesnotexist')).toBeNull();
    expect(resolveIcon('lucide:toString')).toBeNull();
    expect(resolveIcon('foo:bar')).toBeNull();
  });
});
