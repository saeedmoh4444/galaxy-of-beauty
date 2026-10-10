/**
 * Audit #19 — flash deals had no dedicated test file. Covers create math,
 * active filtering + enrichment, atomic claim capacity, and the
 * one-claim-per-user rollback.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let customer: JwtPayload;
let categoryId: number;
let serviceId: number;
const dealIds: number[] = [];
const claimIds: number[] = [];
const userIds: number[] = [];

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const adminDb = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  const cust = await prisma.user.create({ data: buildUser() });
  userIds.push(adminDb.id, cust.id);
  admin = { id: adminDb.id, role: 'ADMIN', email: adminDb.email };
  customer = { id: cust.id, role: 'CUSTOMER', email: cust.email };

  const cat = await prisma.category.findFirst({ select: { id: true } });
  categoryId = cat!.id;
  const svc = await prisma.service.create({
    data: {
      categoryId,
      titleJson: { ar: 'خدمة فلاش', en: 'Flash Service' },
      basePrice: 200,
      durationMin: 60,
      isActive: true,
    },
  });
  serviceId = svc.id;
}, 20000);

afterAll(async () => {
  try {
    await prisma.flashDealClaim.deleteMany({ where: { dealId: { in: dealIds } } });
  } catch {}
  try {
    await prisma.flashDeal.deleteMany({ where: { id: { in: dealIds } } });
  } catch {}
  try {
    await prisma.service.deleteMany({ where: { id: serviceId } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  } catch {}
});

describe('flash deals (audit #19)', () => {
  it('create computes deal/discount prices from the percent', async () => {
    const caller = callerFor(admin);
    const deal = await caller.flashDeals.create({
      serviceId,
      discountPercent: 25,
      maxRedemptions: 5,
      durationHours: 24,
    });
    dealIds.push(deal.id);
    expect(Number(deal.originalPrice)).toBe(200);
    expect(Number(deal.discountValue)).toBe(50);
    expect(Number(deal.dealPrice)).toBe(150);
  }, 15000);

  it('active lists current deals enriched with service names', async () => {
    const caller = callerFor(null);
    const deals = await caller.flashDeals.active();
    const mine = deals.find((d: { id: number }) => d.id === dealIds[0]);
    expect(mine).toBeTruthy();
    expect(mine.serviceNameAr).toBe('خدمة فلاش');
    expect(mine.serviceNameEn).toBe('Flash Service');
  }, 15000);

  it('claim increments capacity and blocks a second claim with rollback', async () => {
    const deal = await prisma.flashDeal.findUniqueOrThrow({ where: { id: dealIds[0] } });
    const before = deal.currentRedemptions;

    const caller = callerFor(customer);
    const first = await caller.flashDeals.claim({ dealId: dealIds[0] });
    expect(first.dealPrice).toBe(150);

    await expect(caller.flashDeals.claim({ dealId: dealIds[0] })).rejects.toThrow(
      /المطالبة بهذا العرض مسبقاً/,
    );

    const after = await prisma.flashDeal.findUniqueOrThrow({ where: { id: dealIds[0] } });
    expect(after.currentRedemptions).toBe(before + 1); // second claim rolled back
  }, 15000);

  it('claim rejects once capacity is exhausted', async () => {
    const caller = callerFor(admin);
    const tiny = await caller.flashDeals.create({
      serviceId,
      discountPercent: 10,
      maxRedemptions: 1,
      durationHours: 1,
    });
    dealIds.push(tiny.id);

    const first = await prisma.user.create({ data: buildUser() });
    userIds.push(first.id);
    const c1 = callerFor({ id: first.id, role: 'CUSTOMER', email: first.email });
    await c1.flashDeals.claim({ dealId: tiny.id });

    const second = await prisma.user.create({ data: buildUser() });
    userIds.push(second.id);
    const c2 = callerFor({ id: second.id, role: 'CUSTOMER', email: second.email });
    await expect(c2.flashDeals.claim({ dealId: tiny.id })).rejects.toThrow(/نفذت الكمية/);
  }, 15000);
});
