/**
 * A5 — vendor list pagination (VENDOR_DASHBOARD_ENHANCEMENT_PLAN):
 * orders and myProducts return { items, nextCursor, total } with an
 * id-desc cursor (stable — createdAt ties can't page deterministically).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const CSRF = 'a'.repeat(64);

async function caller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let owner: JwtPayload;
let customer: JwtPayload;
let vendorId: number;
let categoryId: number;
const userIds: number[] = [];
const orderIds: number[] = [];
const productIds: number[] = [];

describe('vendor list pagination (A5)', { sequential: true }, () => {
  beforeAll(async () => {
    const o = await prisma.user.create({ data: buildUser() });
    const c = await prisma.user.create({ data: buildUser() });
    userIds.push(o.id, c.id);
    owner = { id: o.id, role: 'CUSTOMER', email: o.email };
    customer = { id: c.id, role: 'CUSTOMER', email: c.email };

    const vendor = await prisma.vendor.create({
      data: { userId: o.id, storeName: 'متجر التصفح', storeSlug: `page-${o.id}` },
    });
    vendorId = vendor.id;

    const cat = await prisma.productCategory.create({
      data: { nameJson: { ar: 'منتجات', en: 'Products' }, slug: `page-cat-${Date.now()}` },
    });
    categoryId = cat.id;

    // 25 products + 7 orders — enough to walk multiple pages.
    for (let i = 1; i <= 25; i++) {
      const p = await prisma.product.create({
        data: {
          vendorId,
          categoryId,
          nameJson: { ar: `منتج ${i}`, en: `Product ${i}` },
          descriptionJson: { ar: '', en: '' },
          price: i * 10,
          stock: 100,
          isActive: true,
        },
      });
      productIds.push(p.id);
    }
    for (let i = 1; i <= 7; i++) {
      const order = await prisma.storeOrder.create({
        data: {
          vendorId,
          customerId: c.id,
          totalAmount: i * 50,
          itemCount: 1,
          status: 'PENDING_FULFILLMENT',
        },
      });
      orderIds.push(order.id);
    }
  }, 30000);

  afterAll(async () => {
    try {
      await prisma.storeOrder.deleteMany({ where: { id: { in: orderIds } } });
    } catch {}
    try {
      await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    } catch {}
    try {
      await prisma.productCategory.deleteMany({ where: { id: categoryId } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: vendorId } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    } catch {}
  });

  it('orders returns a limited page with total and nextCursor', async () => {
    const c = await caller(owner);
    const page1 = await c.vendorPortal.orders({ limit: 3 });

    expect(page1.items).toHaveLength(3);
    expect(page1.total).toBe(7);
    expect(page1.nextCursor).toBe(page1.items[2].id);
    // Newest first: the highest id leads.
    expect(page1.items[0].id).toBe(Math.max(...orderIds));
    // B1 — the rows carry their line-item snapshots for the order drawer.
    expect(page1.items[0]).toHaveProperty('items');
    expect(Array.isArray(page1.items[0].items)).toBe(true);
  });

  it('orders cursor walk returns every order exactly once, then null cursor', async () => {
    const c = await caller(owner);
    const seen: number[] = [];
    let cursor: number | undefined;

    do {
      const page = await c.vendorPortal.orders(cursor ? { limit: 2, cursor } : { limit: 2 });
      seen.push(...page.items.map((o: { id: number }) => o.id));
      cursor = page.nextCursor ?? undefined;
    } while (cursor !== undefined && seen.length < 10);

    expect(seen).toHaveLength(7);
    expect(new Set(seen).size).toBe(7);
    expect(seen).toEqual([...orderIds].sort((a, b) => b - a));
  });

  it('orders rejects a limit above the 100 cap', async () => {
    const c = await caller(owner);
    await expect(c.vendorPortal.orders({ limit: 101 })).rejects.toThrow();
  });

  it('myProducts pages the catalog with the portal product shape', async () => {
    const c = await caller(owner);
    const page1 = await c.vendorPortal.myProducts({ limit: 10 });

    expect(page1.items).toHaveLength(10);
    expect(page1.total).toBe(25);
    expect(page1.nextCursor).toBe(page1.items[9].id);
    // toPortalProduct shape: nameAr/price/stock/sales/emoji/active.
    expect(page1.items[0]).toHaveProperty('nameAr');
    expect(page1.items[0]).toHaveProperty('active');

    const page2 = await c.vendorPortal.myProducts({ limit: 10, cursor: page1.nextCursor });
    const page3 = await c.vendorPortal.myProducts({ limit: 10, cursor: page2.nextCursor });
    expect(page2.items).toHaveLength(10);
    expect(page3.items).toHaveLength(5);
    expect(page3.nextCursor).toBeNull();
  });
});
