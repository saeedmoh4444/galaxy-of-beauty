/**
 * C6 — Storefront profile: About editor (descriptionJson bilingual merge),
 * featured picker (product isFeatured, vendor-owned) and featured-first
 * ordering on the public vendor detail.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
let owner: JwtPayload;
let outsider: JwtPayload;
let slug: string;
let productA: number; // oldest — gets featured
let productB: number; // middle
let productC: number; // newest, never featured

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const outsiderU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, outsiderU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  outsider = { id: outsiderU.id, role: 'CUSTOMER', email: outsiderU.email };

  slug = `c6-${Date.now()}`;
  const vendor = await prisma.vendor.create({
    data: {
      userId: ownerU.id,
      storeName: 'C6 Store',
      storeSlug: slug,
      isVerified: true,
      isActive: true,
    },
  });
  await prisma.vendor.create({
    data: {
      userId: outsiderU.id,
      storeName: 'C6 Outsider',
      storeSlug: `c6o-${Date.now()}`,
      isVerified: true,
      isActive: true,
    },
  });

  const cat = await prisma.productCategory.findFirstOrThrow({ orderBy: { sortOrder: 'asc' } });
  const mk = (ar: string) => ({
    vendorId: vendor.id,
    categoryId: cat.id,
    nameJson: { ar, en: ar },
    descriptionJson: { ar: '', en: '' },
    price: 10,
    stock: 5,
    isActive: true,
    isDraft: false,
  });
  const a = await prisma.product.create({ data: mk('أ') });
  productA = a.id;
  const b = await prisma.product.create({ data: mk('ب') });
  productB = b.id;
  const c = await prisma.product.create({ data: mk('ج') });
  productC = c.id;
}, 15000);

afterAll(async () => {
  await prisma.product.deleteMany({ where: { vendor: { userId: { in: createdUserIds } } } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('C6 — About editor (updateStoreProfile)', () => {
  it('merges bilingual About into descriptionJson and surfaces it publicly', async () => {
    const c = callerFor(owner);
    const updated = await c.vendorPortal.updateStoreProfile({ aboutAr: 'مرحبا', aboutEn: 'Hello' });
    expect((updated.descriptionJson as { ar?: string; en?: string }).ar).toBe('مرحبا');

    const detail = await callerFor(null).marketplace.vendorDetail({ slug });
    expect((detail.descriptionJson as { ar?: string; en?: string }).en).toBe('Hello');
  });

  it('a partial edit keeps the other language', async () => {
    const c = callerFor(owner);
    const updated = await c.vendorPortal.updateStoreProfile({ aboutEn: 'Updated' });
    const json = updated.descriptionJson as { ar?: string; en?: string };
    expect(json.en).toBe('Updated');
    expect(json.ar).toBe('مرحبا');
  });
});

describe('C6 — featured picker (setProductFeatured)', () => {
  it('the owner features their own product', async () => {
    const c = callerFor(owner);
    const p = await c.vendorPortal.setProductFeatured({ id: productA, featured: true });
    expect(p.featured).toBe(true);
  });

  it('a non-owner cannot feature the product', async () => {
    const other = callerFor(outsider);
    await expect(
      other.vendorPortal.setProductFeatured({ id: productB, featured: true }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

describe('C6 — featured-first storefront order', () => {
  it('lists the featured product before newer non-featured ones', async () => {
    const detail = await callerFor(null).marketplace.vendorDetail({ slug });
    const ids = detail.products.map((p: { id: number }) => p.id);
    expect(ids).toContain(productA);
    expect(ids).toContain(productB);
    expect(ids).toContain(productC);
    // productA is the OLDEST — featured-first must lift it above the
    // newer non-featured products.
    expect(ids[0]).toBe(productA);
  });
});
