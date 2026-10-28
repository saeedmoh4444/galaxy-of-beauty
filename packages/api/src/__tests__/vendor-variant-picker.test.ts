/**
 * C1c — storefront variant picker data (Wave C): vendorDetail products
 * carry their active variants, and cart lines carry the variant label +
 * price delta for rendering.
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
let customer: JwtPayload;
let productId: number;
let variantId: number;
let slug: string;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, customer].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, customer] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  slug = `c1c-${Date.now()}`;
  const v = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'V c1c', storeSlug: slug, isVerified: true },
  });
  createdVendorIds.push(v.id);

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId: v.id,
      categoryId: cat!.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      descriptionJson: { ar: '', en: '' },
      price: 50,
      stock: 10,
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
      nameJson: { ar: '٥٠ مل', en: '50ml' },
      priceDelta: 5,
      stock: 4,
      lowStockThreshold: 5,
      isActive: true,
    },
  });
  createdVariantIds.push(variant.id);
  variantId = variant.id;
}, 30000);

afterAll(async () => {
  await prisma.cartItem.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.productVariant.deleteMany({ where: { id: { in: createdVariantIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('C1c — storefront variant data', () => {
  it('vendorDetail products carry their active variants', async () => {
    const detail = await (await caller(null)).marketplace.vendorDetail({ slug });
    const product = (detail.products as Array<Record<string, unknown>>).find(
      (p) => Number(p.id) === productId,
    );
    const variants = (product?.variants ?? []) as Array<Record<string, unknown>>;
    expect(variants).toHaveLength(1);
    expect(variants[0]!.id).toBe(variantId);
  });

  it('cart lines carry the variant label + delta', async () => {
    const c = await caller(customer);
    await c.marketplace.addToCart({ productId, variantId, quantity: 2 });
    const cart = await c.marketplace.cart();
    const line = cart.find((i: { variantId: number | null }) => i.variantId === variantId);
    expect(line).toBeDefined();
    const variant = (line as { variant?: Record<string, unknown> }).variant;
    expect((variant?.nameJson as { en?: string } | null)?.en).toBe('50ml');
    expect(Number(variant?.priceDelta)).toBe(5);
  });
});
