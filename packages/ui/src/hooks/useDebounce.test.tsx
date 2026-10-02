import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { JSX } from 'react';

import { useDebounce } from './useDebounce';

let container: HTMLDivElement;
let root: Root;
let value: unknown;

function Harness({ v, delay }: { v: unknown; delay?: number }): JSX.Element | null {
  value = useDebounce(v, delay);
  return null;
}

function render(v: unknown, delay?: number) {
  act(() => {
    root.render(<Harness v={v} delay={delay} />);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  vi.useRealTimers();
});

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    render('first');
    expect(value).toBe('first');
  });

  it('keeps the old value until the delay elapses', () => {
    render('first');
    render('second');
    expect(value).toBe('first');
  });

  it('updates after the default 300ms delay', () => {
    render('first');
    render('second');
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(value).toBe('second');
  });

  it('resets the timer on rapid changes (only the last value lands)', () => {
    render('a');
    act(() => {
      vi.advanceTimersByTime(200);
    });
    render('b');
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(value).toBe('a');
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(value).toBe('b');
  });

  it('honours a custom delay', () => {
    render('x', 50);
    render('y', 50);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(value).toBe('y');
  });
});
