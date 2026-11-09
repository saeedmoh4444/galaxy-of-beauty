import { beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { JSX } from 'react';

import { useHydrated } from './useHydrated';

/**
 * TDD contract for the hydration gate (E2E determinism slice):
 * the hook mirrors the SSR HTML on the first render (false) and flips to
 * true in a passive effect — so interactive controls can stay disabled in
 * the server markup and Playwright's actionability wait (enabled) absorbs
 * the pre-hydration window deterministically.
 */
let container: HTMLDivElement;
let root: Root;
const seen: boolean[] = [];

function Harness(): JSX.Element | null {
  seen.push(useHydrated());
  return null;
}

beforeEach(() => {
  seen.length = 0;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

describe('useHydrated', () => {
  it('reports false on the first render (matches SSR markup)', () => {
    act(() => {
      root.render(<Harness />);
    });
    // The first render must mirror the server output so hydration does not
    // warn about a mismatch and controls stay disabled in the SSR HTML.
    expect(seen[0]).toBe(false);
  });

  it('flips to true once effects flush (client hydrated)', () => {
    act(() => {
      root.render(<Harness />);
    });
    expect(seen.length).toBeGreaterThan(1);
    expect(seen[seen.length - 1]).toBe(true);
  });

  it('stays true across re-renders', () => {
    act(() => {
      root.render(<Harness />);
    });
    act(() => {
      root.render(<Harness />);
    });
    expect(seen[seen.length - 1]).toBe(true);
  });
});
