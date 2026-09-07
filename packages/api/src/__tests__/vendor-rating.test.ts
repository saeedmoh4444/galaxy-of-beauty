/**
 * Store plan Phase 4a — denormalized store rating. marketplace.addReview
 * keeps Vendor.ratingAvg/totalReviews in sync (aggregate of the store's
 * product reviews), which the storefront + mobile browsing read.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
let categoryId: number;
let productId: number;

function callerFor(user: { id: number; email: string }) {
  return (appRouter as any).createCaller({
    user: { id: user.id, role: 'CUSTOMER', email: user.email } as JwtPayload,
    ip: '127.0.0.1',
  });
}

describe('vendor rating (Store Phase 4a)', () => {
  beforeAll(async () => {
    const owner = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(owner.id);
    const cat = await prisma.productCategory.findUnique({ where: { slug: 'general' } });
    categoryId = cat!.id;

    const vendor = await prisma.vendor.create({
      data: {
        userId: owner.id,
        storeName: 'متجر التقييمات',
        storeSlug: `rating-store-${Date.now()}`,
        isVerified: true,
        isActive: true,
      },
    });
    createdVendorIds.push(vendor.id);
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId,
        nameJson: { ar: 'منتج للتقييم', en: 'Review product' },
        descriptionJson: { ar: '', en: '' },
        price: 60,
        stock: 10,
      },
    });
    productId = product.id;
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.productReview.deleteMany({ where: { productId } });
    } catch {}
    try {
      await prisma.product.deleteMany({ where: { id: productId } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('starts at zero', async () => {
    const vendor = await prisma.vendor.findUniqueOrThrow({
      where: { id: createdVendorIds[0] },
    });
    expect(Number(vendor.ratingAvg)).toBe(0);
    expect(vendor.totalReviews).toBe(0);
  });

  it('addReview aggregates into the store rating', async () => {
    const r1 = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(r1.id);
    await callerFor(r1).marketplace.addReview({ productId, rating: 4 });

    let vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: createdVendorIds[0] } });
    expect(Number(vendor.ratingAvg)).toBe(4);
    expect(vendor.totalReviews).toBe(1);

    const r2 = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(r2.id);
    await callerFor(r2).marketplace.addReview({ productId, rating: 2 });

    vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: createdVendorIds[0] } });
    expect(Number(vendor.ratingAvg)).toBe(3);
    expect(vendor.totalReviews).toBe(2);
  });

  it('editing a review re-aggregates without inflating the count', async () => {
    // r1 (the 4-star reviewer) updates to 5 → avg (5+2)/2 = 3.5, count 2.
    const r1 = await prisma.user.findFirstOrThrow({
      where: { id: { in: createdUserIds.slice(1) } },
    });
    await callerFor(r1).marketplace.addReview({ productId, rating: 5 });

    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: createdVendorIds[0] } });
    expect(Number(vendor.ratingAvg)).toBe(3.5);
    expect(vendor.totalReviews).toBe(2);
  });
});
