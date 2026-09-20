/**
 * Jummah slot-blocking tests (6.4) — the window is evaluated in Asia/Riyadh
 * regardless of machine timezone, so all fixtures use explicit +03:00
 * offsets and must behave identically on UTC CI runners.
 */
import { describe, expect, it } from 'vitest';

import { isJummahBlocked } from '../lib/jummah';

// 2026-09-25 is a Friday; 2026-09-22 is a Tuesday (both real dates).
const at = (iso: string, endMinutesLater = 60) => {
  const start = new Date(iso);
  return [start, new Date(start.getTime() + endMinutesLater * 60_000)] as const;
};

describe('isJummahBlocked (Riyadh-anchored)', () => {
  it('blocks a Friday slot inside the prayer window', () => {
    const [start, end] = at('2026-09-25T12:00:00+03:00');
    expect(isJummahBlocked(start, end)).toBe(true);
  });

  it('blocks a Friday slot straddling the window start', () => {
    const [start, end] = at('2026-09-25T11:00:00+03:00'); // 11:00–12:00
    expect(isJummahBlocked(start, end)).toBe(true);
  });

  it('blocks a Friday slot straddling the window end', () => {
    const [start, end] = at('2026-09-25T13:00:00+03:00'); // 13:00–14:00
    expect(isJummahBlocked(start, end)).toBe(true);
  });

  it('allows a Friday slot fully before the window', () => {
    const [start, end] = at('2026-09-25T10:00:00+03:00'); // 10:00–11:00
    expect(isJummahBlocked(start, end)).toBe(false);
  });

  it('allows a Friday slot fully after the window', () => {
    const [start, end] = at('2026-09-25T14:00:00+03:00'); // 14:00–15:00
    expect(isJummahBlocked(start, end)).toBe(false);
  });

  it('allows a Friday slot ending exactly at the window start', () => {
    const [start, end] = at('2026-09-25T10:30:00+03:00'); // 10:30–11:30
    expect(isJummahBlocked(start, end)).toBe(false);
  });

  it('never blocks non-Friday slots', () => {
    const [start, end] = at('2026-09-22T12:00:00+03:00');
    expect(isJummahBlocked(start, end)).toBe(false);
  });

  it('evaluates the window in Riyadh time even when the server is UTC', () => {
    // 11:30–12:30 Riyadh == 08:30–09:30 UTC — a UTC-timezone machine would
    // see this as an ordinary Friday morning, but Riyadh time blocks it.
    const [start, end] = at('2026-09-25T08:30:00+00:00');
    expect(isJummahBlocked(start, end)).toBe(true);
  });

  it('a UTC-evening booking outside the Riyadh window stays allowed', () => {
    // 15:00–16:00 Riyadh == 12:00–13:00 UTC
    const [start, end] = at('2026-09-25T12:00:00+00:00');
    expect(isJummahBlocked(start, end)).toBe(false);
  });
});
