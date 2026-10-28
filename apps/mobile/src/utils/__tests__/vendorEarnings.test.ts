import { describe, it, expect } from 'vitest';
import { scheduleNextRun } from '../vendorEarnings';

const LAST_RUN = '2026-10-26T09:00:00.000Z';

describe('scheduleNextRun', () => {
  it('estimates a WEEKLY next run 7 days after the last run', () => {
    expect(scheduleNextRun('WEEKLY', LAST_RUN)?.toISOString()).toBe('2026-11-02T09:00:00.000Z');
  });

  it('estimates a MONTHLY next run 30 days after the last run', () => {
    expect(scheduleNextRun('MONTHLY', LAST_RUN)?.toISOString()).toBe('2026-11-25T09:00:00.000Z');
  });

  it('returns null for MANUAL (admin-driven — no estimate)', () => {
    expect(scheduleNextRun('MANUAL', LAST_RUN)).toBeNull();
  });

  it('returns null for unknown schedules (defensive)', () => {
    expect(scheduleNextRun('DAILY' as never, LAST_RUN)).toBeNull();
    expect(scheduleNextRun(undefined, LAST_RUN)).toBeNull();
    expect(scheduleNextRun(null, LAST_RUN)).toBeNull();
  });

  it('anchors on now when the store has never been settled', () => {
    const next = scheduleNextRun('WEEKLY', null);
    expect(next).not.toBeNull();
    const ms = next!.getTime() - Date.now();
    expect(ms).toBeGreaterThan(6.9 * 24 * 60 * 60 * 1000);
    expect(ms).toBeLessThan(7.1 * 24 * 60 * 60 * 1000);
  });
});
