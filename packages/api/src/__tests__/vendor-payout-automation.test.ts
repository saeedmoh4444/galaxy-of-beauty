/**
 * A2 — Payout automation (VENDOR_PROFESSIONALIZATION_PLAN Wave A).
 * Vendors pick a payout schedule (MANUAL | WEEKLY | MONTHLY); the daily
 * gob-payouts job settles each scheduled vendor's elapsed window into
 * PENDING payout rows (the same settlement math the admin's
 * calculateStore uses). Transfers stay human — the job never touches
 * money, only the ledger rows + a notification.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { handlePayoutScheduleJob } from '../workers/handlers';
import { calculateVendorSettlements } from '../lib/storePayouts';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdOrderIds: number[] = [];
const createdPayoutIds: number[] = [];
const createdTemplateIds: number[] = [];

let owner: JwtPayload;
let weeklyVendorId: number;
let monthlyVendorId: number;
let manualVendorId: number;

async function caller(user: JwtPayload) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function mkUser() {
  const u = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(u.id);
  return u;
}

async function mkVendor(ownerId: number, slug: string, schedule: string, lastRunAt: Date | null) {
  const v = await prisma.vendor.create({
    data: {
      userId: ownerId,
      storeName: `V ${slug}`,
      storeSlug: slug,
      payoutSchedule: schedule,
      lastPayoutRunAt: lastRunAt,
      // The first-run settlement window is [createdAt, now] — backdate the
      // vendor so the seeded orders (1–3 days old) fall inside it.
      createdAt: new Date(Date.now() - 10 * 86_400_000),
    },
  });
  createdVendorIds.push(v.id);
  return v;
}

async function mkOrder(vendorId: number, daysAgo: number, total = 100) {
  const o = await prisma.storeOrder.create({
    data: {
      vendorId,
      customerId: owner.id,
      totalAmount: total,
      itemCount: 1,
      status: 'FULFILLED',
      createdAt: new Date(Date.now() - daysAgo * 86_400_000),
    },
  });
  createdOrderIds.push(o.id);
  return o;
}

beforeAll(async () => {
  const t = await prisma.notificationTemplate.upsert({
    where: { key: 'payout_processing' },
    update: {},
    create: {
      key: 'payout_processing',
      category: 'provider',
      channels: ['in_app'],
      titleJson: { ar: 'دفعة قيد المعالجة', en: 'Payout Processing' },
      bodyJson: { ar: 'دفعة {{amount}}', en: '{{amount}} payout' },
    },
  });
  createdTemplateIds.push(t.id);

  // Vendor.userId is @unique — one owner per vendor (the house invariant).
  const ownerU = await mkUser();
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  const owner2 = await mkUser();
  const owner3 = await mkUser();
  const owner4 = await mkUser();

  const weekly = await mkVendor(owner.id, `a2-weekly-${Date.now()}`, 'WEEKLY', null);
  const monthly = await mkVendor(owner2.id, `a2-monthly-${Date.now()}`, 'MONTHLY', null);
  const manual = await mkVendor(owner3.id, `a2-manual-${Date.now()}`, 'MANUAL', null);
  weeklyVendorId = weekly.id;
  monthlyVendorId = monthly.id;
  manualVendorId = manual.id;
  // owner4 is the store-less caller for negative ownership tests.

  // Orders: weekly vendor has recent fulfilled orders; monthly has older;
  // manual has orders too (must NOT be settled by the job).
  await mkOrder(weeklyVendorId, 1, 200);
  await mkOrder(weeklyVendorId, 2, 300);
  await mkOrder(monthlyVendorId, 3, 150);
  await mkOrder(manualVendorId, 1, 400);
}, 20000);

afterAll(async () => {
  await prisma.payout.deleteMany({ where: { id: { in: createdPayoutIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.notificationTemplate.deleteMany({ where: { id: { in: createdTemplateIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('A2 — payout automation', () => {
  it('calculateVendorSettlements applies per-vendor commission on FULFILLED orders', async () => {
    const start = new Date(Date.now() - 10 * 86_400_000);
    const end = new Date();
    const settlements = await calculateVendorSettlements(start, end);
    const weekly = settlements.find((s) => s.vendorId === weeklyVendorId);
    expect(weekly).toBeTruthy();
    // 200 + 300 gross, 10% commission → fee 50, net 450.
    expect(weekly!.amount).toBe(450);
    expect(weekly!.fee).toBe(50);
    expect(weekly!.orderCount).toBe(2);
  });

  it('setPayoutSchedule is ownership-guarded and updates the vendor', async () => {
    const c = await caller(owner);
    const updated = await c.vendorPortal.setPayoutSchedule({ schedule: 'WEEKLY' });
    expect(updated.payoutSchedule).toBe('WEEKLY');

    const other = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(other.id);
    const otherC = await caller({ id: other.id, role: 'CUSTOMER', email: other.email });
    await expect(
      otherC.vendorPortal.setPayoutSchedule({ schedule: 'WEEKLY' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('the job settles scheduled vendors and stamps lastPayoutRunAt', async () => {
    const res = await handlePayoutScheduleJob({ data: {} } as never);
    expect(res.settledVendors).toBeGreaterThanOrEqual(2);

    const weeklyPayouts = await prisma.payout.findMany({
      where: { vendorId: weeklyVendorId, status: 'PENDING' },
    });
    expect(weeklyPayouts).toHaveLength(1);
    expect(Number(weeklyPayouts[0].amount)).toBe(450);
    createdPayoutIds.push(weeklyPayouts[0].id);

    const monthlyPayouts = await prisma.payout.findMany({
      where: { vendorId: monthlyVendorId, status: 'PENDING' },
    });
    expect(monthlyPayouts).toHaveLength(1);
    expect(Number(monthlyPayouts[0].amount)).toBe(135);
    createdPayoutIds.push(monthlyPayouts[0].id);

    const manualPayouts = await prisma.payout.findMany({
      where: { vendorId: manualVendorId, status: 'PENDING' },
    });
    expect(manualPayouts).toHaveLength(0);

    const weeklyV = await prisma.vendor.findUniqueOrThrow({ where: { id: weeklyVendorId } });
    expect(weeklyV.lastPayoutRunAt).toBeTruthy();

    // The owner got the payout_processing notification.
    const notifs = await prisma.notification.findMany({
      where: { userId: owner.id, type: 'payout_processing' },
    });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
  });

  it('the job is idempotent inside the window (no double settlements)', async () => {
    const res = await handlePayoutScheduleJob({ data: {} } as never);
    expect(res.settledVendors).toBe(0);
  });

  it('payoutInvoice returns an ownership-guarded CSV for a payout', async () => {
    const c = await caller(owner);
    const payout = await prisma.payout.findFirstOrThrow({
      where: { vendorId: weeklyVendorId, status: 'PENDING' },
    });
    const csv = await c.vendorPortal.payoutInvoice({ payoutId: payout.id, locale: 'en' });
    expect(csv.csv).toContain('450');
    expect(csv.csv).toContain('2'); // order count

    const other = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(other.id);
    const otherC = await caller({ id: other.id, role: 'CUSTOMER', email: other.email });
    await expect(
      otherC.vendorPortal.payoutInvoice({ payoutId: payout.id, locale: 'en' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
