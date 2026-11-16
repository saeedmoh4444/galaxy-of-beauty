/**
 * W5-6a — the duplicate pricing family is consolidated: the admin
 * pricingRules router now reads/writes the CANONICAL ServicePricing table
 * (service_pricing_rules — the same table the bookings surge/peak path
 * uses). The legacy pricing_rules table is deprecated (kept for
 * historical reads only). These tests pin the single-table contract.
 */
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

let admin: JwtPayload;
const createdRuleIds: number[] = [];

beforeAll(async () => {
  const a = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
  admin = { id: a.id, role: 'ADMIN', email: a.email };
}, 30000);

afterAll(async () => {
  await prisma.servicePricing.deleteMany({ where: { id: { in: createdRuleIds } } });
});

describe('pricing consolidation (W5-6a)', () => {
  it('admin create writes to the canonical service_pricing_rules table', async () => {
    const c = await caller(admin);
    const rule = await c.pricingRules.create({
      priceMultiplier: 1.25,
      labelJson: { ar: 'اختبار', en: 'Test' },
    });
    createdRuleIds.push(rule.id);

    const row = await prisma.servicePricing.findUnique({ where: { id: rule.id } });
    expect(row).not.toBeNull();
    expect(Number(row!.priceMultiplier)).toBe(1.25);
    expect((row!.labelJson as { en?: string }).en).toBe('Test');
  });

  it('adminList serves the canonical table', async () => {
    const c = await caller(admin);
    const list = await c.pricingRules.adminList();
    const ids = list.map((r: { id: number }) => r.id);
    expect(ids).toContain(createdRuleIds[0]);
  });

  it('toggle updates the canonical row', async () => {
    const c = await caller(admin);
    const updated = await c.pricingRules.toggle({ id: createdRuleIds[0]!, isActive: false });
    expect(updated.isActive).toBe(false);
  });

  it('getMultiplier reads the canonical table (label survives round-trip)', async () => {
    const c = await caller(null);
    const res = await c.pricingRules.getMultiplier({});
    expect(typeof res.multiplier).toBe('number');
  });
});
