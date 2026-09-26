/**
 * 7.3 Observability 2.0 — SLO/SLI counters + burn-rate math (slice 2).
 *
 * Drives: shared burnRate (pure), the in-process slo counters, the
 * trpc.ts wiring (requests/errors/latency recorded per procedure), and
 * the observability.sloStatus public query.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { burnRate, SLO_TARGET_AVAILABILITY } from '@galaxy/shared';
import {
  resetSloCounters,
  recordSloRequest,
  recordSloError,
  recordSloLatency,
  getSloSnapshot,
} from '../lib/slo';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';

describe('burnRate (shared)', () => {
  it('computes the SRE burn rate against the availability target', () => {
    // 0.1% error rate against 99.9% availability → burn rate 1.
    expect(burnRate(1000, 1)).toBe(1);
    // 1.4% error rate → burn rate 14 (SRE critical threshold).
    expect(burnRate(1000, 14)).toBe(14);
  });

  it('returns 0 with no traffic', () => {
    expect(burnRate(0, 0)).toBe(0);
  });

  it('exposes the availability target', () => {
    expect(SLO_TARGET_AVAILABILITY).toBe(0.999);
  });
});

describe('slo counters', () => {
  beforeEach(() => resetSloCounters());

  it('starts empty with full availability', () => {
    const snap = getSloSnapshot();
    expect(snap.requests).toBe(0);
    expect(snap.availability).toBe(1);
    expect(snap.p95Ms).toBe(0);
    expect(snap.burnRate).toBe(0);
  });

  it('tracks availability and p95 from recorded traffic', () => {
    for (let i = 0; i < 10; i++) recordSloRequest();
    recordSloError();
    recordSloLatency(50);
    recordSloLatency(100);
    recordSloLatency(200);

    const snap = getSloSnapshot();
    expect(snap.requests).toBe(10);
    expect(snap.errors).toBe(1);
    expect(snap.availability).toBe(0.9);
    expect(snap.p95Ms).toBe(200);
    expect(snap.burnRate).toBe(100);
  });
});

describe('observability.sloStatus', () => {
  it('serves the snapshot publicly with the targets', async () => {
    resetSloCounters();
    const ctx = await createTRPCContext();
    const caller = (appRouter as any).createCaller(ctx);

    const status = await caller.observability.sloStatus();
    expect(status).toHaveProperty('requests');
    expect(status).toHaveProperty('availability');
    expect(status).toHaveProperty('p95Ms');
    expect(status).toHaveProperty('burnRate');
    expect(status.targets).toEqual({ availability: 0.999, p95Ms: 500 });
  });

  it('reflects errors recorded through the procedure error path', async () => {
    resetSloCounters();
    const ctx = await createTRPCContext();
    const caller = (appRouter as any).createCaller(ctx);

    await expect(caller.beautyBundles.get({ id: 999_999 })).rejects.toThrow();

    const status = await caller.observability.sloStatus();
    expect(status.requests).toBeGreaterThan(0);
    expect(status.errors).toBeGreaterThan(0);
  });
});
