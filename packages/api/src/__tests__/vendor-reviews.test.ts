/**
 * E4 — Reputation hub (VENDOR_DASHBOARD_ENHANCEMENT_PLAN Wave 5).
 * Merchant review list + summary scoped to the caller's products,
 * reply ownership guards, and the noon-UTC weekly trend buckets.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { weekBucketStart } from '../lib/reviewTrend';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdProductIds: number[] = [];
const createdReviewIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let buyer: JwtPayload;

let ownerVendorId: number;
let outsiderVendorId: number;
let ownerProductId: number;
let outsiderProductId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

/** Create a review under a fresh buyer user — ProductReview is
 *  @@unique([productId, userId]), so each review needs its own author. */
async function addReview(productId: number, rating: number, comment?: string, createdAt?: Date) {
  const reviewer = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(reviewer.id);
  const r = await prisma.productReview.create({
    data: { productId, userId: reviewer.id, rating, comment, ...(createdAt ? { createdAt } : {}) },
  });
  createdReviewIds.push(r.id);
  return r;
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const outsiderU = await prisma.user.create({ data: buildUser() });
  const buyerU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, outsiderU.id, buyerU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  outsider = { id: outsiderU.id, role: 'CUSTOMER', email: outsiderU.email };
  buyer = { id: buyerU.id, role: 'CUSTOMER', email: buyerU.email };

  const ownerV = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Review Store', storeSlug: `rv-${Date.now()}` },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsiderU.id, storeName: 'Outsider Store', storeSlug: `rv2-${Date.now()}` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);
  ownerVendorId = ownerV.id;
  outsiderVendorId = outsiderV.id;

  const cat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'أساسي', en: 'Core' }, slug: `rv-cat-${Date.now()}` },
  });
  createdCategoryIds.push(cat.id);

  const p1 = await prisma.product.create({
    data: {
      vendorId: ownerV.id,
      categoryId: cat.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      descriptionJson: { ar: '', en: '' },
      price: 100,
      stock: 50,
    },
  });
  const p2 = await prisma.product.create({
    data: {
      vendorId: outsiderV.id,
      categoryId: cat.id,
      nameJson: { ar: 'كريم', en: 'Cream' },
      descriptionJson: { ar: '', en: '' },
      price: 60,
      stock: 20,
    },
  });
  createdProductIds.push(p1.id, p2.id);
  ownerProductId = p1.id;
  outsiderProductId = p2.id;
}, 15000);

afterAll(async () => {
  await prisma.productReview.deleteMany({ where: { id: { in: createdReviewIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('E4 — myReviews lists only the caller vendor products', () => {
  it('returns own-product reviews newest first with product + buyer names', async () => {
    await addReview(ownerProductId, 5, 'ممتاز');
    await addReview(ownerProductId, 2, 'مقبول');
    await addReview(outsiderProductId, 1, 'سيء');

    const c = await caller(owner);
    const res = await c.vendorPortal.myReviews({});
    const expected = await prisma.productReview.count({
      where: { product: { vendorId: ownerVendorId } },
    });
    expect(res.total).toBe(expected);
    expect(res.items.every((r: { rating: number }) => r.rating > 0)).toBe(true);
    expect(res.items[0].productNameAr).toBe('سيروم');
    expect(res.items[0].customerName).toBeTruthy();
    expect(res.items.every((r: { replied: boolean }) => r.replied === false)).toBe(true);
    // id-desc: the newest (highest id) review leads.
    const ids = res.items.map((r: { id: number }) => r.id);
    expect([...ids].sort((a, b) => b - a)).toEqual(ids);
  });

  it('scopes the outsider to their own product reviews', async () => {
    const c = await caller(outsider);
    const res = await c.vendorPortal.myReviews({});
    const expected = await prisma.productReview.count({
      where: { product: { vendorId: outsiderVendorId } },
    });
    expect(res.total).toBe(expected);
    expect(res.items.every((r: { productNameAr: string }) => r.productNameAr === 'كريم')).toBe(
      true,
    );
  });

  it('paginates with a stable id cursor', async () => {
    await addReview(ownerProductId, 4, 'صفحة أ');
    await addReview(ownerProductId, 3, 'صفحة ب');
    await addReview(ownerProductId, 5, 'صفحة ج');

    const c = await caller(owner);
    const page1 = await c.vendorPortal.myReviews({ limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).toBe(page1.items[1].id);
    const page2 = await c.vendorPortal.myReviews({ limit: 2, cursor: page1.nextCursor });
    expect(page2.items).toHaveLength(2);
    expect(page2.items[0].id).toBeLessThan(page1.items[1].id);
    const page3 = await c.vendorPortal.myReviews({ limit: 2, cursor: page2.nextCursor });
    expect(page3.items).toHaveLength(1);
    expect(page3.nextCursor).toBeNull();
  });

  it('filters by minimum rating', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.myReviews({ minRating: 5 });
    expect(res.items.every((r: { rating: number }) => r.rating >= 5)).toBe(true);
  });

  it('returns an empty page when the caller has no vendor', async () => {
    const c = await caller(buyer);
    const res = await c.vendorPortal.myReviews({});
    expect(res).toEqual({ items: [], nextCursor: null, total: 0 });
  });
});

describe('E4 — myReviewsSummary', () => {
  it('aggregates avg + distribution over own products only', async () => {
    const c = await caller(owner);
    const s = await c.vendorPortal.myReviewsSummary();
    const rows = await prisma.productReview.findMany({
      where: { product: { vendorId: ownerVendorId } },
      select: { rating: true },
    });
    const expectedAvg =
      rows.length === 0 ? 0 : rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;
    expect(s.total).toBe(rows.length);
    expect(s.avg).toBeCloseTo(expectedAvg);
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of rows) dist[r.rating] += 1;
    expect(s.distribution).toEqual(dist);
  });

  it('counts unreplied 1-star reviews and clears them after a reply', async () => {
    const oneStar = await addReview(ownerProductId, 1, 'تغليف سيء');
    const c = await caller(owner);
    let s = await c.vendorPortal.myReviewsSummary();
    expect(s.unrepliedOneStar).toBeGreaterThanOrEqual(1);
    await c.vendorPortal.replyToReview({ reviewId: oneStar.id, replyAr: 'نعتذر منك' });
    s = await c.vendorPortal.myReviewsSummary();
    const stillUnreplied = await prisma.productReview.count({
      where: { product: { vendorId: ownerVendorId }, rating: 1, repliedAt: null },
    });
    expect(s.unrepliedOneStar).toBe(stillUnreplied);
  });

  it('buckets recent reviews into 8 weekly noon-UTC trend points', async () => {
    const c = await caller(owner);
    const s = await c.vendorPortal.myReviewsSummary();
    expect(s.trend).toHaveLength(8);
    expect(s.trend[s.trend.length - 1].start).toBe(weekBucketStart(new Date()));
    expect(s.trend.reduce((sum: number, b: { count: number }) => sum + b.count, 0)).toBe(s.total);
  });
});

describe('E4 — replyToReview', () => {
  it('persists a merchant reply and returns the updated row', async () => {
    const r = await addReview(ownerProductId, 3, 'جيد');
    const c = await caller(owner);
    const updated = await c.vendorPortal.replyToReview({
      reviewId: r.id,
      replyAr: 'شكراً لتقييمك',
      replyEn: 'Thanks',
    });
    expect(updated.replied).toBe(true);
    expect(updated.replyAr).toBe('شكراً لتقييمك');
    expect(updated.replyEn).toBe('Thanks');
    expect(updated.repliedAt).toBeTruthy();
  });

  it('merges locale replies without clobbering the other language', async () => {
    const r = await addReview(ownerProductId, 4, 'ممتاز');
    const c = await caller(owner);
    await c.vendorPortal.replyToReview({ reviewId: r.id, replyAr: 'شكراً' });
    const updated = await c.vendorPortal.replyToReview({ reviewId: r.id, replyEn: 'Thank you' });
    expect(updated.replyAr).toBe('شكراً');
    expect(updated.replyEn).toBe('Thank you');
  });

  it('rejects a reply to a review on another vendor product', async () => {
    const other = await addReview(outsiderProductId, 1, 'لا يعجبني');
    const c = await caller(owner);
    await expect(
      c.vendorPortal.replyToReview({ reviewId: other.id, replyAr: 'لن أرد' }),
    ).rejects.toThrow(/Review not found/);
  });

  it('rejects a reply to a missing review', async () => {
    const c = await caller(owner);
    await expect(
      c.vendorPortal.replyToReview({ reviewId: 999_999_999, replyAr: 'x' }),
    ).rejects.toThrow(/Review not found/);
  });

  it('rejects an empty reply', async () => {
    const r = await addReview(ownerProductId, 2, 'ok');
    const c = await caller(owner);
    await expect(c.vendorPortal.replyToReview({ reviewId: r.id, replyAr: '' })).rejects.toThrow();
  });
});

describe('E4 — weekBucketStart (noon-UTC week buckets)', () => {
  it('buckets a Monday-evening UTC review into the same week (Monday start)', () => {
    // 2026-10-19T18:00Z → −12h noon-UTC shift → Mon 2026-10-19 → start 2026-10-19
    expect(weekBucketStart(new Date('2026-10-19T18:00:00Z'))).toBe('2026-10-19');
  });

  it('places a Sunday review into the previous week', () => {
    // 2026-10-18T22:00Z → −12h → Sun 2026-10-18 → Monday start 2026-10-12
    expect(weekBucketStart(new Date('2026-10-18T22:00:00Z'))).toBe('2026-10-12');
  });
});
