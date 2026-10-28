/**
 * D1c — vendor API stock writes (Wave D): ERP/inventory integrations set
 * absolute stock over the API key, with the same belongs-to guards as
 * the portal's stockIn.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];
const createdVariantIds: number[] = [];
const createdKeyIds: number[] = [];

let owner: JwtPayload;
let customer: JwtPayload;
let productId: number;
let variantId: number;
let plaintext = '';

async function caller(user: JwtPayload | null, apiKey?: string | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1', apiKey: apiKey ?? null });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, customer].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, customer] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const slugBase = `d1c-${Date.now()}`;
  const v = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'V d1c', storeSlug: `${slugBase}-o` },
  });
  createdVendorIds.push(v.id);

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId: v.id,
      categoryId: cat!.id,
      nameJson: { ar: 'D1C', en: 'D1C' },
      descriptionJson: { ar: '', en: '' },
      price: 10,
      stock: 5,
      sales: 0,
      emoji: '🧴',
      images: [],
      isActive: true,
    },
  });
  createdProductIds.push(p.id);
  productId = p.id;

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      nameJson: { ar: '٥٠', en: '50ml' },
      priceDelta: 2,
      stock: 3,
      lowStockThreshold: 5,
    },
  });
  createdVariantIds.push(variant.id);
  variantId = variant.id;

  const c = await caller(owner);
  const res = await c.vendorPortal.createApiKey({ name: 'ERP' });
  createdKeyIds.push(res.key.id);
  plaintext = res.plaintext;
}, 30000);

afterAll(async () => {
  await prisma.vendorApiKey.deleteMany({ where: { id: { in: createdKeyIds } } });
  await prisma.productVariant.deleteMany({ where: { id: { in: createdVariantIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('D1c — vendor API stock writes', () => {
  it('sets the absolute product stock over the API key', async () => {
    const c = await caller(null, plaintext);
    const res = await c.vendorApi.updateStock({ productId, stock: 42 });
    expect(res.stock).toBe(42);
    const p = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(p.stock).toBe(42);
  });

  it('sets variant stock with the belongs-to guard', async () => {
    const c = await caller(null, plaintext);
    const res = await c.vendorApi.updateStock({ productId, variantId, stock: 9 });
    expect(res.stock).toBe(9);

    await expect(
      c.vendorApi.updateStock({ productId: productId + 999, variantId, stock: 1 }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects unauthenticated writes', async () => {
    await expect(
      (await caller(null)).vendorApi.updateStock({ productId, stock: 1 }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
