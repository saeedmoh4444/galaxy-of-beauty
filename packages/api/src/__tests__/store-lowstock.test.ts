/**
 * B3b — low-stock threshold (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
 * Product.lowStockThreshold (default 5): the dashboard surfaces products at
 * or below threshold, and checkout emits a `store_low_stock` notification to
 * the vendor only when a sale crosses the threshold (old stock > threshold,
 * new stock ≤ threshold) — not on every sale below it.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { prisma, Prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import crypto from 'crypto';
import { buildUser } from './factories';
import { calculateShippingCharge } from '../lib/fatoorah';

vi.mock('../lib/fatoorah', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/fatoorah')>();
  return {
    ...actual,
    calculateShippingCharge: vi.fn(),
  };
});

const chargeMock = vi.mocked(calculateShippingCharge);

const createdUserIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdCheckoutIds: number[] = [];
const createdOrderIds: number[] = [];
const createdNotifIds: number[] = [];

let owner: JwtPayload;
let customer: JwtPayload;
let catId: number;

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

/** Track + return every low-stock notification for the vendor owner. */
async function lowStockNotifs(): Promise<Array<{ id: number; type: string; bodyJson: unknown }>> {
  const rows = await prisma.notification.findMany({
    where: { userId: owner.id, type: 'store_low_stock' },
  });
  rows.forEach((n) => {
    if (!createdNotifIds.includes(n.id)) createdNotifIds.push(n.id);
  });
  return rows;
}

async function makeProduct(
  vendorId: number,
  nameJson: { ar: string; en: string },
  opts: { stock: number; threshold?: number; isActive?: boolean },
): Promise<number> {
  const p = await prisma.product.create({
    data: {
      vendorId,
      categoryId: catId,
      nameJson,
      descriptionJson: { ar: '', en: '' },
      price: 100,
      stock: opts.stock,
      lowStockThreshold: opts.threshold ?? 5,
      isActive: opts.isActive ?? true,
    },
  });
  return p.id;
}

async function seedCart(productId: number, quantity = 1): Promise<void> {
  // C1 — the cart lost its (userId, productId) unique (variants coexist as
  // separate lines); merge duplicate adds via findFirst like addToCart does.
  const existing = await prisma.cartItem.findFirst({
    where: { userId: customer.id, productId },
    select: { id: true },
  });
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
  } else {
    await prisma.cartItem.create({ data: { userId: customer.id, productId, quantity } });
  }
}

beforeEach(() => {
  vi.clearAllMocks();
});

beforeAll(async () => {
  const ownerUser = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerUser.id);
  owner = { id: ownerUser.id, role: 'CUSTOMER', email: ownerUser.email };
  const vendor = await prisma.vendor.create({
    data: { userId: ownerUser.id, storeName: 'LowStock Store', storeSlug: `ls-${Date.now()}` },
  });

  const buyer = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(buyer.id);
  customer = { id: buyer.id, role: 'CUSTOMER', email: buyer.email };

  const cat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'مستلزمات', en: 'Supplies' }, slug: `ls-cat-${Date.now()}` },
  });
  createdCategoryIds.push(cat.id);
  catId = cat.id;
}, 15000);

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { id: { in: createdNotifIds } } });
  await prisma.walletTransaction.deleteMany({
    where: { wallet: { userId: { in: createdUserIds } } },
  });
  await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.storeCheckout.deleteMany({ where: { id: { in: createdCheckoutIds } } });
  await prisma.cartItem.deleteMany({ where: { userId: { in: createdUserIds } } });
  // Products + vendors by owner: addProduct auto-creates vendor rows, so
  // delete by userId to catch them all (children before parents).
  await prisma.product.deleteMany({ where: { vendor: { userId: { in: createdUserIds } } } });
  await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  // A5 — wallet purchases create wallet + checkout rows referencing the
  // customer (onDelete Restrict) — clear before the users go.
  await prisma.storeCheckout.deleteMany({ where: { customerId: { in: createdUserIds } } });
  await prisma.walletTransaction.deleteMany({
    where: { wallet: { userId: { in: createdUserIds } } },
  });
  await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  vi.clearAllMocks();
});

describe('vendorPortal.dashboard — low-stock surface (B3b)', () => {
  it('lists products at or below threshold, stock-ascending, excluding healthy/inactive rows', async () => {
    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { userId: owner.id } });
    const low1 = await makeProduct(vendor.id, { ar: 'غسول', en: 'Cleanser' }, { stock: 3 });
    const low0 = await makeProduct(vendor.id, { ar: 'قناع', en: 'Mask' }, { stock: 0 });
    await makeProduct(vendor.id, { ar: 'عطر', en: 'Perfume' }, { stock: 8 }); // healthy
    await makeProduct(vendor.id, { ar: 'مخفي', en: 'Hidden' }, { stock: 1, isActive: false });

    const c = await caller(owner);
    const dash = await c.vendorPortal.dashboard();

    expect(dash.lowStockProducts).toHaveLength(2);
    // Stock-ascending: the sold-out product first.
    expect(dash.lowStockProducts[0]).toMatchObject({ id: low0, stock: 0, threshold: 5 });
    expect(dash.lowStockProducts[1]).toMatchObject({ id: low1, stock: 3, threshold: 5 });
  });

  it('returns an empty list for a fresh vendor with no products', async () => {
    const c = await caller(customer);
    const dash = await c.vendorPortal.dashboard();
    expect(dash.lowStockProducts).toEqual([]);
  });
});

describe('vendorPortal.addProduct — threshold input (B3b)', () => {
  it('persists a caller-supplied lowStockThreshold', async () => {
    const c = await caller(customer);
    const p = await c.vendorPortal.addProduct({
      nameAr: 'شامبو',
      price: 45,
      stock: 30,
      lowStockThreshold: 12,
    });
    expect(p.threshold).toBe(12);

    const row = await prisma.product.findUnique({ where: { id: p.id } });
    expect(row?.lowStockThreshold).toBe(12);
  });

  it('defaults the threshold to 5 when omitted', async () => {
    const c = await caller(customer);
    const p = await c.vendorPortal.addProduct({ nameAr: 'بلسم', price: 30, stock: 9 });
    expect(p.threshold).toBe(5);
  });
});

describe('checkout — low_stock event emission (B3b)', () => {
  it('a wallet purchase emits store_low_stock to the vendor only when the sale crosses the threshold', async () => {
    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { userId: owner.id } });
    // 6 → 4 crosses (old 6 > 5, new 4 ≤ 5).
    const crossing = await makeProduct(vendor.id, { ar: 'سيروم', en: 'Serum' }, { stock: 6 });
    // 3 → 2 stays below — no re-notification on every sale.
    const below = await makeProduct(vendor.id, { ar: 'تونر', en: 'Toner' }, { stock: 3 });
    // 9 → 8 stays above — no alert.
    const above = await makeProduct(vendor.id, { ar: 'كريم', en: 'Cream' }, { stock: 9 });

    await seedCart(crossing, 2);
    await seedCart(below, 1);
    await seedCart(above, 1);

    const c = await caller(customer);
    // payCart calculates the shipping charge through the mocked fatoorah
    // lib — the bare vi.fn() must return a charge for the purchase.
    chargeMock.mockResolvedValue({ shippingCharge: 25 });
    const res = await buyWithWallet(c, customer.id);
    expect(res.status).toBe('PAID');

    // Track the purchase's orders for teardown (their items hold the
    // product FK Restrict alive until the orders are deleted).
    const orders = await prisma.storeOrder.findMany({
      where: { customerId: customer.id, checkoutId: res.checkoutId },
    });
    orders.forEach((o) => createdOrderIds.push(o.id));

    const notifs = await lowStockNotifs();
    expect(notifs).toHaveLength(1);
    const body = notifs[0]!.bodyJson as { en?: string };
    expect(body.en).toContain('Serum');
    expect(body.en).toContain('4');
  });

  it('wallet payCart emits the same crossing alert', async () => {
    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { userId: owner.id } });
    const crossing = await makeProduct(vendor.id, { ar: 'زيوت', en: 'Oils' }, { stock: 6 });
    await seedCart(crossing, 2);
    await prisma.wallet.upsert({
      where: { userId: customer.id },
      create: { userId: customer.id, balance: new Prisma.Decimal(1000) },
      update: { balance: new Prisma.Decimal(1000) },
    });
    chargeMock.mockResolvedValue({ shippingCharge: 0 });

    const c = await caller(customer);
    const res = await c.payments.payCart({
      idempotencyKey: `ls_${Date.now()}_w`,
      method: 'wallet',
      shipping: SHIPPING,
    });
    createdCheckoutIds.push(res.checkoutId);
    const orders = await prisma.storeOrder.findMany({ where: { checkoutId: res.checkoutId } });
    orders.forEach((o) => createdOrderIds.push(o.id));

    const notifs = await lowStockNotifs();
    const oilNotifs = notifs.filter((n) =>
      ((n.bodyJson as { en?: string }).en ?? '').includes('Oils'),
    );
    expect(oilNotifs).toHaveLength(1);
  });
});
