/**
 * C2b — stock-in (Wave C): increment product or variant stock with
 * ownership + belongs-to guards. The barcode/QR flow (D-scan) feeds the
 * same mutation.
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

let owner: JwtPayload;
let outsider: JwtPayload;
let productId: number;
let variantId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, outsider].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, outsider] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const slugBase = `c2b-${Date.now()}`;
  const ownerV = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'V c2b owner', storeSlug: `${slugBase}-o` },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsider.id, storeName: 'V c2b outsider', storeSlug: `${slugBase}-x` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId: ownerV.id,
      categoryId: cat!.id,
      nameJson: { ar: 'شامبو', en: 'Shampoo' },
      descriptionJson: { ar: '', en: '' },
      price: 20,
      stock: 3,
      sales: 0,
      emoji: '🧴',
      images: [],
      isActive: true,
    },
  });
  createdProductIds.push(p.id);
  productId = p.id;

  const v = await prisma.productVariant.create({
    data: {
      productId,
      nameJson: { ar: '٥٠٠ مل', en: '500ml' },
      priceDelta: 5,
      stock: 2,
      lowStockThreshold: 5,
    },
  });
  createdVariantIds.push(v.id);
  variantId = v.id;
}, 30000);

afterAll(async () => {
  await prisma.productVariant.deleteMany({ where: { id: { in: createdVariantIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('C2b — stockIn', () => {
  it('increments the base product stock', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.stockIn({ productId, quantity: 5 });
    expect(res.stock).toBe(8); // 3 + 5
    const p = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(p.stock).toBe(8);
  });

  it('increments the variant stock when a variant is targeted', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.stockIn({ productId, variantId, quantity: 4 });
    expect(res.stock).toBe(6); // 2 + 4
    const v = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    expect(v.stock).toBe(6);
    const p = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(p.stock).toBe(8); // base untouched
  });

  it('rejects a variant that belongs to another product', async () => {
    const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
    const other = await prisma.product.create({
      data: {
        vendorId: (await prisma.product.findUniqueOrThrow({ where: { id: productId } })).vendorId,
        categoryId: cat!.id,
        nameJson: { ar: 'آخر', en: 'Other' },
        descriptionJson: { ar: '', en: '' },
        price: 10,
        stock: 1,
        sales: 0,
        emoji: '🧴',
        images: [],
        isActive: true,
      },
    });
    createdProductIds.push(other.id);

    const c = await caller(owner);
    await expect(
      c.vendorPortal.stockIn({ productId: other.id, variantId, quantity: 1 }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('rejects a foreign product with NOT_FOUND', async () => {
    const c = await caller(outsider);
    await expect(c.vendorPortal.stockIn({ productId, quantity: 1 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
