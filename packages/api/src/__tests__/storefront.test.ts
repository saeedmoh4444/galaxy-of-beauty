/**
 * Store plan Phase 2 — public storefront backend coverage. The pages
 * (/stores, /stores/[slug]) consume marketplace.vendors + vendorDetail;
 * these procedures had no tests.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
let categoryId: number;

async function caller() {
  return (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
}

describe('public storefront (Store Phase 2)', () => {
  beforeAll(async () => {
    const u1 = await prisma.user.create({ data: buildUser() });
    const u2 = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(u1.id, u2.id);

    const cat = await prisma.productCategory.findUnique({ where: { slug: 'general' } });
    categoryId = cat!.id;

    // Verified store with 1 product.
    const verified = await prisma.vendor.create({
      data: {
        userId: u1.id,
        storeName: 'متجر موثق',
        storeSlug: `verified-${Date.now()}`,
        descriptionJson: { ar: 'وصف المتجر', en: 'Store description' },
        isVerified: true,
        isActive: true,
      },
    });
    createdVendorIds.push(verified.id);
    await prisma.product.create({
      data: {
        vendorId: verified.id,
        categoryId,
        nameJson: { ar: 'منتج موثق', en: 'Verified product' },
        descriptionJson: { ar: '', en: '' },
        price: 120,
        stock: 5,
      },
    });

    // Unverified store — must stay hidden from the public listing.
    const unverified = await prisma.vendor.create({
      data: {
        userId: u2.id,
        storeName: 'متجر غير موثق',
        storeSlug: `unverified-${Date.now()}`,
        isVerified: false,
        isActive: true,
      },
    });
    createdVendorIds.push(unverified.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.product.deleteMany({ where: { vendorId: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('marketplace.vendors lists verified stores only, with product counts', async () => {
    const c = await caller();
    const res = await c.marketplace.vendors({ page: 1, limit: 50 });

    const names = res.items.map((v: { storeName: string }) => v.storeName);
    expect(names).toContain('متجر موثق');
    expect(names).not.toContain('متجر غير موثق');

    const verified = res.items.find((v: { storeName: string }) => v.storeName === 'متجر موثق');
    expect(verified._count.products).toBe(1);
  });

  it('vendorDetail returns the store with its products by slug', async () => {
    const c = await caller();
    const listing = await c.marketplace.vendors({ page: 1, limit: 50 });
    const verified = listing.items.find((v: { storeName: string }) => v.storeName === 'متجر موثق');

    const detail = await c.marketplace.vendorDetail({ slug: verified.storeSlug });
    expect(detail.storeName).toBe('متجر موثق');
    expect(detail.products.length).toBe(1);
    expect(detail.products[0].nameJson.ar).toBe('منتج موثق');
  });

  it('vendorDetail throws NOT_FOUND for an unknown slug', async () => {
    const c = await caller();
    await expect(c.marketplace.vendorDetail({ slug: 'no-such-store' })).rejects.toThrow();
  });
});
