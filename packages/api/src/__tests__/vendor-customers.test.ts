/**
 * E5 — CRM-lite (VENDOR_DASHBOARD_ENHANCEMENT_PLAN Wave 5).
 * Repeat-customer aggregates over store orders: top spenders, order
 * counts, recency, and the repeat-customer rate. Aggregate-only — rows
 * carry name/phone (already on the order drawer), never email/addresses.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdOrderIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let bystander: JwtPayload;

let ownerVendorId: number;
let outsiderVendorId: number;

const DAY = 86_400_000;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function addOrder(vendorId: number, customerId: number, total: number, createdAt?: Date) {
  const o = await prisma.storeOrder.create({
    data: {
      vendorId,
      customerId,
      totalAmount: total,
      itemCount: 1,
      status: 'FULFILLED',
      ...(createdAt ? { createdAt } : {}),
    },
  });
  createdOrderIds.push(o.id);
  return o;
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const outsiderU = await prisma.user.create({ data: buildUser() });
  const bystanderU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, outsiderU.id, bystanderU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  outsider = { id: outsiderU.id, role: 'CUSTOMER', email: outsiderU.email };
  bystander = { id: bystanderU.id, role: 'CUSTOMER', email: bystanderU.email };

  const ownerV = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'CRM Store', storeSlug: `crm-${Date.now()}` },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsiderU.id, storeName: 'Outsider Store', storeSlug: `crm2-${Date.now()}` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);
  ownerVendorId = ownerV.id;
  outsiderVendorId = outsiderV.id;
}, 15000);

afterAll(async () => {
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('E5 — customers (repeat-customer CRM-lite)', () => {
  it('aggregates own-store customers with spend, orders and recency', async () => {
    const a = await prisma.user.create({ data: buildUser() });
    const b = await prisma.user.create({ data: buildUser() });
    const c = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(a.id, b.id, c.id);

    // A: two orders (repeat), older first; B: one order; C: orders only on
    // the OTHER vendor's store.
    await addOrder(ownerVendorId, a.id, 100, new Date(Date.now() - 10 * DAY));
    await addOrder(ownerVendorId, a.id, 50);
    await addOrder(ownerVendorId, b.id, 200, new Date(Date.now() - 5 * DAY));
    await addOrder(outsiderVendorId, c.id, 999);

    const c1 = await caller(owner);
    const res = await c1.vendorPortal.customers({});
    expect(res.total).toBe(2);

    const byName = new Map(res.items.map((i) => [i.customerName, i]));
    const aRow = byName.get(a.name);
    expect(aRow?.orderCount).toBe(2);
    expect(aRow?.totalSpent).toBe(150);
    expect(aRow?.repeat).toBe(true);
    expect(aRow?.lastOrderAt).toBeTruthy();
    const bRow = byName.get(b.name);
    expect(bRow?.orderCount).toBe(1);
    expect(bRow?.repeat).toBe(false);
    expect(byName.has(c.name)).toBe(false);

    // no-PII leak: rows expose name/phone only, never email or addresses.
    for (const row of res.items) {
      expect('email' in row).toBe(false);
      expect('address' in row).toBe(false);
      expect('passwordHash' in row).toBe(false);
    }
  });

  it('sorts by total spent, descending', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.customers({});
    const spent = res.items.map((i) => i.totalSpent);
    expect([...spent].sort((x, y) => y - x)).toEqual(spent);
  });

  it('computes the repeat-customer rate over the whole customer base', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.customers({});
    // A repeat + B single → 0.5.
    expect(res.repeatRate).toBeCloseTo(0.5);
    expect(res.repeatCustomers).toBe(1);
  });

  it('paginates the aggregated rows with a customerId cursor', async () => {
    const c = await caller(owner);
    const page1 = await c.vendorPortal.customers({ limit: 1 });
    expect(page1.items).toHaveLength(1);
    expect(page1.nextCursor).toBe(page1.items[0].customerId);
    const page2 = await c.vendorPortal.customers({ limit: 1, cursor: page1.nextCursor });
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0].customerId).not.toBe(page1.items[0].customerId);
    expect(page2.nextCursor).toBeNull();
  });

  it('returns an empty page when the caller has no vendor', async () => {
    const c = await caller(bystander);
    const res = await c.vendorPortal.customers({});
    expect(res).toEqual({ items: [], total: 0, repeatRate: 0, repeatCustomers: 0 });
  });
});
