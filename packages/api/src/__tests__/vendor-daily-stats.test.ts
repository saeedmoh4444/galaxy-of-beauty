/**
 * D1 — Vendor analytics read-model: the nightly materialization handler
 * builds one VendorDailyStat row per (vendor, NOON-UTC bucket day) from
 * FULFILLED store orders — idempotent upserts, new-vs-returning customer
 * split, per-product sales. The vendorPortal.analyticsSeries query reads
 * only the read model.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Job } from 'bullmq';
import { prisma } from '@galaxy/db';
import { handleDailyStatsJob, noonUtcDay, type DailyStatsJob } from '../workers/handlers';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
let owner: JwtPayload;
let vendorId: number;
let productId: number;
let firstTimerId: number;
let returningId: number;

// A fixed KSA business date: 2026-10-15 (bucket 2026-10-15T00:00:00Z).
const DAY = noonUtcDay('2026-10-15');
const DAY_END = new Date(DAY.getTime() + 24 * 3600_000);
const IN_BUCKET = new Date(DAY.getTime() + 14 * 3600_000); // 14:00Z — inside the noon→noon bucket

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeOrder(customerId: number, total: number, createdAt: Date, qty = 1) {
  const order = await prisma.storeOrder.create({
    data: {
      vendorId,
      customerId,
      totalAmount: total,
      itemCount: qty,
      status: 'FULFILLED',
      createdAt,
    },
  });
  await prisma.storeOrderItem.create({
    data: {
      orderId: order.id,
      productId,
      nameSnapshot: { ar: 'سيروم' },
      priceSnapshot: total / qty,
      quantity: qty,
      createdAt,
    },
  });
  return order;
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const firstU = await prisma.user.create({ data: buildUser() });
  const retU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, firstU.id, retU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  firstTimerId = firstU.id;
  returningId = retU.id;

  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'D1 Store', storeSlug: `d1-${Date.now()}` },
  });
  vendorId = vendor.id;
  const cat = await prisma.productCategory.findFirstOrThrow({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: cat.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      descriptionJson: { ar: '', en: '' },
      price: 100,
      stock: 50,
      isActive: true,
      isDraft: false,
    },
  });
  productId = p.id;

  // First-timer: only order in the bucket.
  await makeOrder(firstU.id, 200, IN_BUCKET, 2);
  // Returning: has an earlier FULFILLED order, plus one in the bucket.
  await makeOrder(retU.id, 150, new Date(DAY.getTime() - 24 * 3600_000));
  await makeOrder(retU.id, 300, new Date(DAY.getTime() + 18 * 3600_000), 3);
}, 20000);

afterAll(async () => {
  await prisma.vendorDailyStat.deleteMany({ where: { vendorId } });
  await prisma.storeOrderItem.deleteMany({ where: { order: { vendorId } } });
  await prisma.storeOrder.deleteMany({ where: { vendorId } });
  await prisma.product.deleteMany({ where: { vendorId } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('D1 — noon-UTC bucket discipline', () => {
  it('shifts 12h: 10:00Z and 14:00Z land in different buckets', () => {
    const a = noonUtcDay(new Date(Date.UTC(2026, 9, 15, 10, 0)));
    const b = noonUtcDay(new Date(Date.UTC(2026, 9, 15, 14, 0)));
    expect(a.toISOString()).toBe('2026-10-14T00:00:00.000Z'); // before noon → previous bucket
    expect(b.toISOString()).toBe('2026-10-15T00:00:00.000Z'); // after noon → this bucket
  });
});

describe('D1 — materialization job', () => {
  it('builds the vendor daily row from FULFILLED orders', async () => {
    const res = await handleDailyStatsJob({ data: { date: '2026-10-15' } } as Job<DailyStatsJob>);
    expect(res.vendors).toBeGreaterThanOrEqual(1);

    const row = await prisma.vendorDailyStat.findUnique({
      where: { vendorId_day: { vendorId, day: DAY } },
    });
    expect(row).not.toBeNull();
    expect(Number(row!.revenue)).toBe(500); // 200 + 300
    expect(row!.orders).toBe(2); // first-timer + returning in-bucket
    expect(Number(row!.aov)).toBe(250);
    expect(row!.newCustomers).toBe(1);
    expect(row!.returningCustomers).toBe(1);

    const sales = row!.productSales as Array<{ productId: number; quantity: number }>;
    expect(sales).toHaveLength(1);
    expect(sales[0]!.productId).toBe(productId);
    expect(sales[0]!.quantity).toBe(5); // 2 + 3
  });

  it('is idempotent — a re-run upserts, never duplicates', async () => {
    await handleDailyStatsJob({ data: { date: '2026-10-15' } } as Job<DailyStatsJob>);
    await handleDailyStatsJob({ data: { date: '2026-10-15' } } as Job<DailyStatsJob>);

    const rows = await prisma.vendorDailyStat.findMany({ where: { vendorId } });
    expect(rows).toHaveLength(1);
    expect(Number(rows[0]!.revenue)).toBe(500);
  });
});

describe('D1 — analyticsSeries reads the read model', () => {
  it('returns the daily series for the window', async () => {
    const c = callerFor(owner);
    const res = await c.vendorPortal.analyticsSeries({ days: 30 });
    expect(res.series.length).toBeGreaterThanOrEqual(1);
    const today = res.series.find((s: { day: string }) => s.day === DAY.toISOString());
    expect(today).toBeDefined();
    expect(today!.revenue).toBe(500);
    expect(today!.orders).toBe(2);
    expect(today!.aov).toBe(250);
    expect(res.topProducts).toHaveLength(1);
    expect(res.topProducts[0]!.quantity).toBe(5);
  });
});
