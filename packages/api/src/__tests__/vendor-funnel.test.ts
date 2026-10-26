/**
 * B5 — Funnel analytics (VENDOR_PROFESSIONALIZATION_PLAN Wave B).
 * The storefronts report views via trackStoreView (increment-only,
 * client-side session-deduped); the Analytics tab shows the funnel:
 * 30d views → orders → conversion + repeat rate + top-viewed products.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { noonUtcDay } from '../workers/handlers';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];
const createdOrderIds: number[] = [];
const createdViewIds: number[] = [];

let owner: JwtPayload;
let vendorId: number;
let productId: number;
let slug: string;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  slug = `b5-${Date.now()}`;
  const v = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'V b5', storeSlug: slug, isVerified: true },
  });
  createdVendorIds.push(v.id);
  vendorId = v.id;

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId,
      categoryId: cat!.id,
      nameJson: { ar: 'منتج ب5', en: 'B5 product' },
      descriptionJson: { ar: '', en: '' },
      price: 50,
      stock: 5,
      sales: 0,
      emoji: '🧴',
      images: [],
      isActive: true,
    },
  });
  createdProductIds.push(p.id);
  productId = p.id;

  // Two fulfilled orders 5 days ago → funnel orders + repeat data.
  for (let i = 0; i < 2; i++) {
    const o = await prisma.storeOrder.create({
      data: {
        vendorId,
        customerId: ownerU.id,
        totalAmount: 100,
        itemCount: 1,
        status: 'FULFILLED',
        createdAt: new Date(Date.now() - 5 * 86_400_000),
      },
    });
    createdOrderIds.push(o.id);
  }
}, 20000);

afterAll(async () => {
  await prisma.storeViewLog.deleteMany({ where: { id: { in: createdViewIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('B5 — funnel analytics', () => {
  it('trackStoreView increments the daily view log and product view counts', async () => {
    const c = await caller(null);
    await c.marketplace.trackStoreView({ slug });
    await c.marketplace.trackStoreView({ slug });

    const log = await prisma.storeViewLog.findUniqueOrThrow({
      where: { vendorId_day: { vendorId, day: noonUtcDay(new Date()) } },
    });
    createdViewIds.push(log.id);
    expect(log.views).toBe(2);

    const p = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(p.viewCount).toBe(2);
  });

  it('trackStoreView ignores unknown slugs (silent no-op)', async () => {
    const c = await caller(null);
    const res = await c.marketplace.trackStoreView({ slug: `nope-${Date.now()}` });
    expect(res.ok).toBe(true); // never errors — analytics must not break pages
  });

  it('the funnel returns 30d views, orders, conversion and top products', async () => {
    const c = await caller(owner);
    const f = await c.vendorPortal.funnel();
    expect(f.views30d).toBeGreaterThanOrEqual(2);
    expect(f.orders30d).toBe(2);
    expect(f.conversion).toBeGreaterThanOrEqual(0);
    expect(f.repeatRate).toBeGreaterThanOrEqual(0);
    expect(f.topViewed.length).toBeGreaterThanOrEqual(1);
    expect(f.topViewed[0].productId).toBe(productId);
  });

  it('funnel is ownership-guarded (non-vendors get an empty shape, not data)', async () => {
    const otherU = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(otherU.id);
    const other = await caller({ id: otherU.id, role: 'CUSTOMER', email: otherU.email });
    const f = await other.vendorPortal.funnel();
    expect(f.views30d).toBe(0);
  });
});
