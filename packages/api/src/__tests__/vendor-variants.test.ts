/**
 * C1 — product variants (VENDOR_PROFESSIONALIZATION_PLAN Wave C): variant
 * CRUD with ownership guards, price-delta guardrails, variant cart lines
 * and variant-stock checkout (incl. the B3b low-stock crossing at variant
 * level).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma, Prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import crypto from 'crypto';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];
const createdVariantIds: number[] = [];
const createdOrderIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let customer: JwtPayload;
let ownerVendorId: number;
let outsiderVendorId: number;
let productId: number;
let price: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

// A5 — buyCart was removed (unpaid orders are gone). Tests purchase
// through the REAL wallet checkout instead.
const SHIPPING = {
  personName: 'Saeed Test',
  mobile: '0500000000',
  lineAddress: 'Test Street 1',
  cityName: 'RIYADH',
  postalCode: '12345',
  countryCode: 'SA',
  shippingMethod: 1 as const,
};

async function buyWithWallet(c: ReturnType<typeof caller>, userId: number) {
  await prisma.wallet.upsert({
    where: { userId },
    create: { userId, balance: new Prisma.Decimal(100000) },
    update: { balance: new Prisma.Decimal(100000) },
  });
  return c.payments.payCart({
    idempotencyKey: crypto.randomUUID(),
    method: 'wallet',
    shipping: SHIPPING,
  });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, outsider, customer].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, outsider, customer] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const slugBase = `c1-${Date.now()}`;
  const ownerV = await prisma.vendor.create({
    data: {
      userId: owner.id,
      storeName: 'V c1 owner',
      storeSlug: `${slugBase}-o`,
      isVerified: true,
    },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsider.id, storeName: 'V c1 outsider', storeSlug: `${slugBase}-x` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);
  ownerVendorId = ownerV.id;
  outsiderVendorId = outsiderV.id;

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  price = 50;
  const p = await prisma.product.create({
    data: {
      vendorId: ownerVendorId,
      categoryId: cat!.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      descriptionJson: { ar: '', en: '' },
      price,
      stock: 10,
      lowStockThreshold: 5,
      sales: 0,
      emoji: '🧴',
      images: [],
      isActive: true,
    },
  });
  createdProductIds.push(p.id);
  productId = p.id;
}, 30000);

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.cartItem.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.storeOrderItem.deleteMany({
    where: { order: { vendorId: { in: createdVendorIds } } },
  });
  await prisma.storeOrder.deleteMany({ where: { vendorId: { in: createdVendorIds } } });
  await prisma.productVariant.deleteMany({ where: { id: { in: createdVariantIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  // A5 — wallet purchases create checkouts/wallet rows referencing the
  // customer (onDelete Restrict) — clear before the users go.
  await prisma.storeCheckout.deleteMany({ where: { customerId: { in: createdUserIds } } });
  await prisma.walletTransaction.deleteMany({
    where: { wallet: { userId: { in: createdUserIds } } },
  });
  await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('C1 — variant CRUD', () => {
  it('addVariant creates a variant and variants lists it', async () => {
    const c = await caller(owner);
    const v = await c.vendorPortal.addVariant({
      productId,
      nameAr: '٥٠ مل',
      nameEn: '50ml',
      sku: 'SER-50',
      priceDelta: 10,
      stock: 6,
      lowStockThreshold: 5,
    });
    createdVariantIds.push(v.id);
    // Decimal fields serialize as strings through the superjson transformer.
    expect(Number(v.priceDelta)).toBe(10);
    expect(v.stock).toBe(6);

    const list = await c.vendorPortal.variants({ productId });
    expect(list.some((row: { id: number }) => row.id === v.id)).toBe(true);
    expect((list[0]!.nameJson as { en?: string }).en).toBe('50ml');
  });

  it('rejects another vendor with NOT_FOUND (no cross-store writes)', async () => {
    const c = await caller(outsider);
    await expect(
      c.vendorPortal.addVariant({ productId, nameAr: 'x', nameEn: 'x', priceDelta: 1, stock: 1 }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects a price delta that would make the final price negative', async () => {
    const c = await caller(owner);
    await expect(
      c.vendorPortal.addVariant({ productId, nameAr: 'x', nameEn: 'x', priceDelta: -60, stock: 1 }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('updateVariant applies partial changes and deleteVariant removes it', async () => {
    const c = await caller(owner);
    const v = await c.vendorPortal.addVariant({
      productId,
      nameAr: 'مؤقت',
      nameEn: 'Temp',
      priceDelta: 0,
      stock: 2,
    });
    createdVariantIds.push(v.id);

    const updated = await c.vendorPortal.updateVariant({ variantId: v.id, stock: 9 });
    expect(updated.stock).toBe(9);
    expect(Number(updated.priceDelta)).toBe(0); // untouched

    await c.vendorPortal.deleteVariant({ variantId: v.id });
    const list = await c.vendorPortal.variants({ productId });
    expect(list.some((row: { id: number }) => row.id === v.id)).toBe(false);
  });
});

describe('C1 — variant checkout', () => {
  it('buys a variant line at base+delta, decrementing variant stock only', async () => {
    const c = await caller(owner);
    const v = await c.vendorPortal.addVariant({
      productId,
      nameAr: 'وردي عميق',
      nameEn: 'Deep Rose',
      priceDelta: 5,
      stock: 6,
      lowStockThreshold: 5,
    });
    createdVariantIds.push(v.id);

    const cart = await caller(customer);
    await cart.marketplace.addToCart({ productId, variantId: v.id, quantity: 2 });
    await buyWithWallet(cart, customer.id);

    const item = await prisma.storeOrderItem.findFirst({
      where: { productId, variantId: v.id },
      orderBy: { id: 'desc' },
    });
    expect(item).not.toBeNull();
    expect(Number(item!.priceSnapshot)).toBe(price + 5);
    expect(item!.quantity).toBe(2);
    expect((item!.variantNameJson as { en?: string }).en).toBe('Deep Rose');

    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: v.id } });
    expect(variant.stock).toBe(4); // 6 - 2
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(product.stock).toBe(10); // base stock untouched by variant sale
  });

  it('emits a low-stock alert when a variant sale crosses its threshold', async () => {
    const c = await caller(owner);
    const v = await c.vendorPortal.addVariant({
      productId,
      nameAr: 'عسل',
      nameEn: 'Honey',
      priceDelta: 0,
      stock: 6, // above threshold 5
      lowStockThreshold: 5,
    });
    createdVariantIds.push(v.id);

    const cart = await caller(customer);
    await cart.marketplace.addToCart({ productId, variantId: v.id, quantity: 2 }); // 6 → 4
    await buyWithWallet(cart, customer.id);

    const notifs = await prisma.notification.findMany({
      where: { userId: owner.id, type: 'store_low_stock' },
      orderBy: { createdAt: 'desc' },
    });
    expect(notifs.length).toBeGreaterThan(0);
    expect(JSON.stringify(notifs[0]!.bodyJson)).toContain('Honey');
  });

  it('rejects a variant that belongs to another product', async () => {
    const c = await caller(owner);
    const other = await prisma.product.create({
      data: {
        vendorId: ownerVendorId,
        categoryId: (await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } }))!.id,
        nameJson: { ar: 'آخر', en: 'Other' },
        descriptionJson: { ar: '', en: '' },
        price: 20,
        stock: 5,
        sales: 0,
        emoji: '🧴',
        images: [],
        isActive: true,
      },
    });
    createdProductIds.push(other.id);
    const v = await c.vendorPortal.addVariant({
      productId: other.id,
      nameAr: 'أ',
      nameEn: 'A',
      priceDelta: 0,
      stock: 1,
    });
    createdVariantIds.push(v.id);

    const cart = await caller(customer);
    await expect(
      cart.marketplace.addToCart({ productId, variantId: v.id, quantity: 1 }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('keeps the no-variant base line working (regression)', async () => {
    const cart = await caller(customer);
    await cart.marketplace.addToCart({ productId, quantity: 1 });
    await buyWithWallet(cart, customer.id);

    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(product.stock).toBe(9); // 10 - 1 (base line decrements base stock)
  });
});
