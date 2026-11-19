import { describe, it, expect } from 'vitest';
import { isJummahBlocked } from '../lib/jummah';
import { uniqueSlotWindow } from './factories';

/**
 * Property check for the slot-window math behind createUniqueSlot.
 *
 * Root cause being pinned: the factory's Jummah guard used to check only
 * the slot START minute, but bookings.create rejects any slot whose
 * INTERVAL overlaps the Friday 11:30-13:30 Riyadh window. A 1h slot
 * starting in UTC (07:30, 08:30) ends inside the window — the router
 * rejected it and booking-lifecycle failed on a Thursday CI run
 * (2026-11-19) purely from the random per-process offset.
 *
 * Invariant: every window the factory can produce must satisfy
 * isJummahBlocked(start, end) === false, for any offset and any
 * per-technician watermark history.
 */
describe('createUniqueSlot window math — Jummah safety property', () => {
  it('never produces a window the router would reject, across random offsets', () => {
    let seed = 0xc0ffee;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };

    for (let trial = 0; trial < 3000; trial++) {
      const offsetHours = Math.floor(rand() * 5000);
      // Simulate a process that hands out slots sequentially for one
      // technician (the watermark evolves exactly like the real factory).
      let lastEndMs: number | undefined;
      const seqs = 1 + Math.floor(rand() * 40);
      for (let seq = 1; seq <= seqs; seq++) {
        const durationMs = [3_600_000, 5_400_000][Math.floor(rand() * 2)]!;
        const { start, end } = uniqueSlotWindow(seq, offsetHours, lastEndMs, durationMs);

        expect(
          isJummahBlocked(start, end),
          `Jummah violation: offset=${offsetHours}h seq=${seq} start=${start.toISOString()}`,
        ).toBe(false);

        if (lastEndMs !== undefined) {
          expect(
            start.getTime(),
            `watermark violation: seq=${seq} start=${start.toISOString()} lastEnd=${new Date(lastEndMs).toISOString()}`,
          ).toBeGreaterThanOrEqual(lastEndMs + 3_600_000);
        }
        lastEndMs = end.getTime();
      }
    }
  });
});
