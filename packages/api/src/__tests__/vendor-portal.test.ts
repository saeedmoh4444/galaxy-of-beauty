/**
 * vendorPortal + marketplace.buyCart tests — B.3. The router used to be an
 * in-memory array (products vanished on restart); now backed by the
 * Product/Vendor models. Covers persistence, per-vendor isolation, the buy
 * flow (stock/sales/vendor revenue), and cart clearing.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let customer: JwtPayload;
let otherCustomer: JwtPayload;

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeVendor(userId: number, storeName: string, slug: string) {
  const vendor = await prisma.vendor.create({
    data: { userId, storeName, storeSlug: slug },
  });
  createdVendorIds.push(vendor.id);
  return vendor;
}

async function generalCategoryId(): Promise<number> {
  const cat = await prisma.productCategory.findUnique({ where: { slug: 'general' } });
  return cat!.id;
}

describe('vendorPortal + buy flow (B.3)', () => {
  beforeAll(async () => {
    const u1 = await prisma.user.create({ data: buildUser() });
    customer = { id: u1.id, role: 'CUSTOMER', email: u1.email };
    const u2 = await prisma.user.create({ data: buildUser() });
    otherCustomer = { id: u2.id, role: 'CUSTOMER', email: u2.email };
    createdUserIds.push(u1.id, u2.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.cartItem.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    // Products + vendors by owner: addProduct auto-creates vendor rows, so
    // delete by userId to catch them all (children before parents).
    try {
      await prisma.product.deleteMany({ where: { vendor: { userId: { in: createdUserIds } } } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous callers', async () => {
    const anon = await caller(null);
    await expect(anon.vendorPortal.dashboard()).rejects.toThrow();
  });

  it('dashboard starts at zero for a fresh vendor-less user', async () => {
    const c = await caller(customer);
    const dash = await c.vendorPortal.dashboard();
    expect(dash.totalProducts).toBe(0);
    expect(dash.totalSales).toBe(0);
    expect(dash.revenue).toBe(0);
    expect(dash.rating).toBeGreaterThan(0); // default rating shown
  });

  it('addProduct persists a DB row and auto-creates the vendor + default category', async () => {
    const c = await caller(customer);
    const p = await c.vendorPortal.addProduct({
      nameAr: 'زيت الأرغان',
      price: 120,
      stock: 5,
      emoji: '',
    });

    expect(p.id).toBeTypeOf('number');
    expect(p.nameAr).toBe('زيت الأرغان');
    expect(p.sales).toBe(0);
    expect(p.active).toBe(true);

    const vendor = await prisma.vendor.findUnique({ where: { userId: customer.id } });
    expect(vendor).not.toBeNull();

    const row = await prisma.product.findUniqueOrThrow({ where: { id: p.id } });
    expect(row.vendorId).toBe(vendor!.id);
    expect(row.sales).toBe(0);
    expect(row.stock).toBe(5);
    expect((row.nameJson as { ar: string }).ar).toBe('زيت الأرغان');
    // Default category fallback
    expect(row.categoryId).toBe(await generalCategoryId());
  });

  it('myProducts only shows the caller vendor products', async () => {
    const otherVendor = await makeVendor(otherCustomer.id, 'متجر آخر', `other-${Date.now()}`);
    const otherProduct = await prisma.product.create({
      data: {
        vendorId: otherVendor.id,
        categoryId: await generalCategoryId(),
        nameJson: { ar: 'منتج آخر', en: 'Other product' },
        descriptionJson: { ar: '', en: '' },
        price: 50,
        stock: 3,
      },
    });

    const c = await caller(customer);
    const mine = await c.vendorPortal.myProducts();
    expect(mine.length).toBe(1);
    expect(mine[0]!.nameAr).toBe('زيت الأرغان');

    const other = await caller(otherCustomer);
    const theirs = await other.vendorPortal.myProducts();
    expect(theirs.length).toBe(1);
    expect(theirs[0]!.id).toBe(otherProduct.id);
  });

  it('dashboard aggregates sales and revenue from the DB', async () => {
    const c = await caller(customer);
    const mine = await c.vendorPortal.myProducts();
    const productId = mine[0]!.id;

    await prisma.product.update({
      where: { id: productId },
      data: { sales: 4, stock: 1 },
    });

    const dash = await c.vendorPortal.dashboard();
    expect(dash.totalProducts).toBe(1);
    expect(dash.totalSales).toBe(4);
    expect(dash.revenue).toBe(120 * 4);
  });

  it('deleteProduct soft-deletes and hides from myProducts', async () => {
    const c = await caller(customer);
    const mine = await c.vendorPortal.myProducts();
    const productId = mine[0]!.id;

    await c.vendorPortal.deleteProduct({ id: productId });
    const after = await c.vendorPortal.myProducts();
    expect(after.find((p: { id: number }) => p.id === productId)).toBeUndefined();

    const row = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(row.isActive).toBe(false);
  });

  it('buyCart decrements stock, increments sales, credits revenue, clears cart', async () => {
    // Fresh product for the buy flow.
    const vendor = await prisma.vendor.findUnique({ where: { userId: customer.id } });
    const product = await prisma.product.create({
      data: {
        vendorId: vendor!.id,
        categoryId: await generalCategoryId(),
        nameJson: { ar: 'ماسك الطين', en: 'Clay mask' },
        descriptionJson: { ar: '', en: '' },
        price: 80,
        stock: 10,
      },
    });

    const c = await caller(customer);
    await c.marketplace.addToCart({ productId: product.id, quantity: 2 });

    const res = await c.marketplace.buyCart({});
    expect(res.items).toBe(2);
    expect(res.total).toBe(160);

    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updated.stock).toBe(8);
    expect(updated.sales).toBe(2);

    const updatedVendor = await prisma.vendor.findUnique({ where: { userId: customer.id } });
    expect(Number(updatedVendor!.totalSales)).toBe(160);

    const cart = await prisma.cartItem.findMany({ where: { userId: customer.id } });
    expect(cart.length).toBe(0);
  });

  it('buyCart rejects purchases beyond stock and leaves everything intact', async () => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: customer.id } });
    const product = await prisma.product.create({
      data: {
        vendorId: vendor!.id,
        categoryId: await generalCategoryId(),
        nameJson: { ar: 'سيروم نادر', en: 'Rare serum' },
        descriptionJson: { ar: '', en: '' },
        price: 300,
        stock: 1,
      },
    });

    const c = await caller(customer);
    await c.marketplace.addToCart({ productId: product.id, quantity: 5 });

    await expect(c.marketplace.buyCart({})).rejects.toThrow(/stock/i);

    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updated.stock).toBe(1);
    expect(updated.sales).toBe(0);
    const cart = await prisma.cartItem.findMany({ where: { userId: customer.id } });
    expect(cart.length).toBe(1); // cart kept for correction
  });
});
