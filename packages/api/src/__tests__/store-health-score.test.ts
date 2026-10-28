/**
 * D2 — store health score composition: thresholds, decay and neutrality,
 * plus the dashboard/admin surfacing (integration).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { computeStoreHealthScore, decayWeight, type StoreHealthFactors } from '../lib/storeHealth';

const createdUserIds: number[] = [];
let owner: JwtPayload;
let vendorId: number;

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'D2 Store', storeSlug: `d2-${Date.now()}` },
  });
  vendorId = vendor.id;
}, 15000);

afterAll(async () => {
  await prisma.product.deleteMany({ where: { vendorId } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

const perfect: StoreHealthFactors = {
  fulfillmentSpeedHours: 6,
  slaBreachRate: 0,
  cancelRate: 0,
  reviewTrend: 5,
  stockHealth: 1,
  disputeEscalationRate: 0,
};

describe('D2 — score composition', () => {
  it('a perfect store scores 100', () => {
    expect(computeStoreHealthScore(perfect).score).toBe(100);
  });

  it('a worst-case store scores 0', () => {
    const worst: StoreHealthFactors = {
      fulfillmentSpeedHours: 100,
      slaBreachRate: 1,
      cancelRate: 0.5,
      reviewTrend: 1,
      stockHealth: 0,
      disputeEscalationRate: 1,
    };
    const res = computeStoreHealthScore(worst);
    expect(res.score).toBe(0);
    expect(res.hints.length).toBeGreaterThan(0);
  });

  it('a store with no data is neutral (60) — not punished', () => {
    const none: StoreHealthFactors = {
      fulfillmentSpeedHours: null,
      slaBreachRate: null,
      cancelRate: null,
      reviewTrend: null,
      stockHealth: null,
      disputeEscalationRate: null,
    };
    const res = computeStoreHealthScore(none);
    expect(res.score).toBe(60);
    expect(res.hints).toEqual([]);
  });

  it('fulfillment threshold: ≤12h full marks, ≥72h zero', () => {
    expect(computeStoreHealthScore({ ...perfect, fulfillmentSpeedHours: 12 }).score).toBe(100);
    expect(computeStoreHealthScore({ ...perfect, fulfillmentSpeedHours: 72 }).score).toBe(75); // 0×0.25 + 100×0.75
    expect(
      computeStoreHealthScore({
        ...perfect,
        fulfillmentSpeedHours: 72,
        slaBreachRate: null,
        cancelRate: null,
        reviewTrend: null,
        stockHealth: null,
        disputeEscalationRate: null,
      }).score,
    ).toBe(45); // known-bad fulfillment (0) + five neutral factors (60×0.75)
  });

  it('cancel threshold: ≥30% zeroes the factor', () => {
    expect(computeStoreHealthScore({ ...perfect, cancelRate: 0.3 }).score).toBe(80);
  });

  it('stock health maps linearly', () => {
    expect(computeStoreHealthScore({ ...perfect, stockHealth: 0.5 }).score).toBe(93);
  });

  it('A5 — SLA breach rate: ≥20% zeroes the factor, hints surface', () => {
    expect(computeStoreHealthScore({ ...perfect, slaBreachRate: 0.2 }).score).toBe(85);
    const bad = computeStoreHealthScore({ ...perfect, slaBreachRate: 0.3 });
    expect(bad.score).toBe(85);
    expect(bad.hints.some((h) => h.key === 'vendorPortal.health.hint.sla')).toBe(true);
  });

  it('A5 — dispute escalation rate: ≥50% zeroes the factor', () => {
    expect(computeStoreHealthScore({ ...perfect, disputeEscalationRate: 0.5 }).score).toBe(90);
    const bad = computeStoreHealthScore({ ...perfect, disputeEscalationRate: 0.6 });
    expect(bad.hints.some((h) => h.key === 'vendorPortal.health.hint.dispute')).toBe(true);
  });
});

describe('D2 — dashboard surfaces the health score', () => {
  it('returns a 0–100 score with hints for a store with no history', async () => {
    const c = callerFor(owner);
    const dash = await c.vendorPortal.dashboard();
    expect(dash.health.score).toBeGreaterThanOrEqual(0);
    expect(dash.health.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(dash.health.hints)).toBe(true);
  });

  it('admin vendor list includes the same score', async () => {
    const adminU = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    const a = callerFor({ id: adminU.id, role: 'ADMIN', email: adminU.email });
    const vendors = await a.payouts.listStoreVendors();
    const mine = vendors.find((v: { id: number }) => v.id === vendorId);
    expect(mine).toBeDefined();
    expect(mine!.health.score).toBeGreaterThanOrEqual(0);
    expect(mine!.health.score).toBeLessThanOrEqual(100);
  });
});

describe('D2 — review recency decay', () => {
  it('a review halves its weight every 30 days', () => {
    expect(decayWeight(0)).toBe(1);
    expect(decayWeight(30)).toBeCloseTo(0.5);
    expect(decayWeight(60)).toBeCloseTo(0.25);
    expect(decayWeight(90)).toBeCloseTo(0.125);
  });
});
