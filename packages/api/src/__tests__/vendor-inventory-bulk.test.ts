/**
 * C2 — inventory v2 (Wave C): bulk stock editor + velocity forecasts.
 * bulkStockUpdate is all-or-nothing (a foreign product in the batch
 * rejects the WHOLE batch — no partial writes); stockForecasts ignores
 * product ids the caller does not own.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let ownerVendorId: number;
let p1: number;
let p2: number;
let foreignProduct: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, outsider].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, outsider] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const slugBase = `c2-${Date.now()}`;
  const ownerV = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'V c2 owner', storeSlug: `${slugBase}-o` },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsider.id, storeName: 'V c2 outsider', storeSlug: `${slugBase}-x` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);
  ownerVendorId = ownerV.id;

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const mk = async (vendorId: number, name: string, stock: number) =>
    prisma.product.create({
      data: {
        vendorId,
        categoryId: cat!.id,
        nameJson: { ar: name, en: name },
        descriptionJson: { ar: '', en: '' },
        price: 30,
        stock,
        sales: 0,
        emoji: '🧴',
        images: [],
        isActive: true,
      },
    });

  p1 = (await mk(ownerVendorId, 'P1', 5)).id;
  p2 = (await mk(ownerVendorId, 'P2', 8)).id;
  foreignProduct = (await mk(outsiderV.id, 'Foreign', 3)).id;
  createdProductIds.push(p1, p2, foreignProduct);

  // Velocity fixtures: 30-day daily stats for the owner (P1: 30 units).
  const dayMs = 24 * 60 * 60 * 1000;
  await prisma.vendorDailyStat.createMany({
    data: Array.from({ length: 30 }, (_, i) => ({
      vendorId: ownerVendorId,
      day: new Date(Date.now() - (29 - i) * dayMs),
      revenue: 30,
      orders: 1,
      aov: 30,
      newCustomers: 0,
      returningCustomers: 0,
      productSales: [{ productId: p1, nameAr: 'P1', quantity: 1, revenue: 30 }],
    })),
  });
}, 30000);

afterAll(async () => {
  await prisma.vendorDailyStat.deleteMany({ where: { vendorId: { in: createdVendorIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('C2 — bulkStockUpdate', () => {
  it('updates every row in the batch', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.bulkStockUpdate({
      updates: [
        { productId: p1, stock: 42 },
        { productId: p2, stock: 7 },
      ],
    });
    expect(res).toHaveLength(2);
    const a = await prisma.product.findUniqueOrThrow({ where: { id: p1 } });
    const b = await prisma.product.findUniqueOrThrow({ where: { id: p2 } });
    expect(a.stock).toBe(42);
    expect(b.stock).toBe(7);
  });

  it('rejects a batch containing a foreign product with NO partial writes', async () => {
    const c = await caller(owner);
    await expect(
      c.vendorPortal.bulkStockUpdate({
        updates: [
          { productId: p1, stock: 99 },
          { productId: foreignProduct, stock: 1 },
        ],
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    const a = await prisma.product.findUniqueOrThrow({ where: { id: p1 } });
    expect(a.stock).toBe(42); // untouched from the previous test
  });

  it('rejects an empty batch', async () => {
    const c = await caller(owner);
    await expect(c.vendorPortal.bulkStockUpdate({ updates: [] })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });
});

describe('C2 — stockForecasts', () => {
  it('computes per-product velocity from the 30-day daily stats', async () => {
    const c = await caller(owner);
    const forecasts = await c.vendorPortal.stockForecasts({ productIds: [p1, p2] });
    expect(forecasts[p1]!.velocityPerDay).toBe(1); // 30 units / 30 days
    expect(forecasts[p1]!.daysAtStock).toBe(42); // stock 42 / 1 per day
    expect(forecasts[p2]!.velocityPerDay).toBe(0); // no sales
    expect(forecasts[p2]!.daysAtStock).toBeNull();
  });

  it('ignores product ids the caller does not own', async () => {
    const c = await caller(owner);
    const forecasts = await c.vendorPortal.stockForecasts({
      productIds: [foreignProduct],
    });
    expect(forecasts[foreignProduct]).toBeUndefined();
  });
});
