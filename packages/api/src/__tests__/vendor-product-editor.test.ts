/**
 * C1 — Product editor pro (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
 * Ownership-guarded edit (name/price/stock/emoji/category/descriptions/
 * images), bilingual completeness meter, draft toggle (hidden from
 * storefronts), and duplication ("create similar" → draft, stock 0).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let catId: number;
let productId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const outsiderU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, outsiderU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  outsider = { id: outsiderU.id, role: 'CUSTOMER', email: outsiderU.email };

  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Editor Store', storeSlug: `edit-${Date.now()}` },
  });
  // The outsider has their own store so the guard reaches the ownership
  // check (FORBIDDEN) instead of stopping at "store not found".
  await prisma.vendor.create({
    data: { userId: outsiderU.id, storeName: 'Outsider Store', storeSlug: `out-${Date.now()}` },
  });
  const cat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'عناية', en: 'Care' }, slug: `ed-cat-${Date.now()}` },
  });
  catId = cat.id;

  const p = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: cat.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      descriptionJson: { ar: '', en: '' },
      price: 90,
      stock: 5,
    },
  });
  productId = p.id;
}, 15000);

afterAll(async () => {
  await prisma.product.deleteMany({ where: { vendor: { userId: { in: createdUserIds } } } });
  await prisma.productCategory.deleteMany({ where: { id: catId } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('C1 — updateProduct (editor)', () => {
  it('owner edits name/price/stock/emoji/category/descriptions/images', async () => {
    const c = await caller(owner);
    const updated = await c.vendorPortal.updateProduct({
      id: productId,
      nameAr: 'سيروم فيتامين سي',
      nameEn: 'Vitamin C Serum',
      price: 110,
      stock: 12,
      emoji: '🍊',
      categoryId: catId,
      descAr: 'لمعان فوري',
      descEn: 'Instant glow',
      images: ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/b.jpg'],
    });

    expect(updated.nameAr).toBe('سيروم فيتامين سي');
    expect(updated.nameEn).toBe('Vitamin C Serum');
    expect(updated.price).toBe(110);
    expect(updated.stock).toBe(12);
    expect(updated.emoji).toBe('🍊');
    expect(updated.images).toHaveLength(2);

    const row = await prisma.product.findUnique({ where: { id: productId } });
    expect((row?.nameJson as { ar: string }).ar).toBe('سيروم فيتامين سي');
    expect((row?.descriptionJson as { en: string }).en).toBe('Instant glow');
  });

  it('rejects a non-owner', async () => {
    const c = await caller(outsider);
    await expect(c.vendorPortal.updateProduct({ id: productId, price: 1 })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('rejects a missing product', async () => {
    const c = await caller(owner);
    await expect(c.vendorPortal.updateProduct({ id: 999_999, price: 1 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('partial edits merge instead of clobbering the other language', async () => {
    const c = await caller(owner);
    // ar-only rename keeps the existing en name.
    const updated = await c.vendorPortal.updateProduct({ id: productId, nameAr: 'سيروم مركّز' });
    expect(updated.nameEn).toBe('Vitamin C Serum');
  });
});

describe('C1 — completeness meter', () => {
  it('scores bilingual name + description fields in steps of 25', async () => {
    const c = await caller(owner);
    // nameAr + nameEn + descAr + descEn are all set from the edit test.
    let rows = await c.vendorPortal.myProducts({ limit: 20 });
    const full = rows.items.find((p) => p.id === productId);
    expect(full?.completeness).toBe(100);

    // Wipe the descriptions → 50.
    await prisma.product.update({
      where: { id: productId },
      data: { descriptionJson: { ar: '', en: '' } },
    });
    rows = await c.vendorPortal.myProducts({ limit: 20 });
    expect(rows.items.find((p) => p.id === productId)?.completeness).toBe(50);
  });
});

describe('C1 — draft toggle + storefront hiding', () => {
  it('setDraft flips the flag; drafts disappear from storefront listings', async () => {
    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { userId: owner.id } });
    const c = await caller(owner);
    const drafted = await c.vendorPortal.setDraft({ id: productId, draft: true });
    expect(drafted.draft).toBe(true);

    // Still visible in the portal list (marked draft).
    const rows = await c.vendorPortal.myProducts({ limit: 20 });
    expect(rows.items.find((p) => p.id === productId)?.draft).toBe(true);

    // Hidden from both shopper-facing surfaces.
    const pub = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
    const listing = await pub.marketplace.products({ vendorId: vendor.id });
    expect(listing.items.find((p) => p.id === productId)).toBeUndefined();
    const detail = await pub.marketplace.vendorDetail({ slug: vendor.storeSlug });
    expect(detail.products.find((p) => p.id === productId)).toBeUndefined();

    // Un-draft restores storefront visibility.
    await c.vendorPortal.setDraft({ id: productId, draft: false });
    const listing2 = await pub.marketplace.products({ vendorId: vendor.id });
    expect(listing2.items.find((p) => p.id === productId)).toBeDefined();
  });
});

describe('C1 — duplicateProduct ("create similar")', () => {
  it('copies catalog fields into a fresh draft with zero stock and sales', async () => {
    const c = await caller(owner);
    const copy = await c.vendorPortal.duplicateProduct({ id: productId });

    expect(copy.id).not.toBe(productId);
    expect(copy.price).toBe(110);
    expect(copy.stock).toBe(0);
    expect(copy.sales).toBe(0);
    expect(copy.draft).toBe(true);

    const row = await prisma.product.findUnique({ where: { id: copy.id } });
    expect(row?.isDraft).toBe(true);
    expect((row?.nameJson as { en: string }).en).toContain('copy');
  });

  it('rejects a non-owner', async () => {
    const c = await caller(outsider);
    await expect(c.vendorPortal.duplicateProduct({ id: productId })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});
