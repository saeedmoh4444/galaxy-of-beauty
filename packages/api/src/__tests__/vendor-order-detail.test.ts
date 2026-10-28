/**
 * E2 — orderDetail (VENDOR_PROFESSIONALIZATION_PLAN Wave E): one store
 * order with line items, customer summary and its dispute (1:1). Powers
 * the mobile order-detail screen and the push-notification deep link.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdStaffIds: number[] = [];
const createdProductIds: number[] = [];
const createdOrderIds: number[] = [];

let owner: JwtPayload;
let clerk: JwtPayload; // staff with ORDERS_MANAGE on the owner's vendor
let outsider: JwtPayload;
let customer: JwtPayload;
let ownerVendorId: number;
let orderId: number;
let itemId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, clerk, outsider, customer].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, clerk, outsider, customer] = users.map((u) => ({
    id: u.id,
    role: 'CUSTOMER',
    email: u.email,
  }));

  const slugBase = `e2-${Date.now()}`;
  const ownerV = await prisma.vendor.create({
    data: {
      userId: owner.id,
      storeName: 'V e2 owner',
      storeSlug: `${slugBase}-o`,
      isVerified: true,
    },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsider.id, storeName: 'V e2 outsider', storeSlug: `${slugBase}-x` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);
  ownerVendorId = ownerV.id;

  const clerkRow = await prisma.vendorStaff.create({
    data: {
      vendorId: ownerVendorId,
      userId: clerk.id,
      role: 'STAFF',
      permissions: ['ORDERS_MANAGE'],
      status: 'ACTIVE',
      invitedBy: owner.id,
    },
  });
  createdStaffIds.push(clerkRow.id);

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId: ownerVendorId,
      categoryId: cat!.id,
      nameJson: { ar: 'منتج إي٢', en: 'E2 product' },
      descriptionJson: { ar: '', en: '' },
      price: 60,
      stock: 5,
      sales: 0,
      emoji: '🧴',
      images: [],
      isActive: true,
    },
  });
  createdProductIds.push(p.id);

  const o = await prisma.storeOrder.create({
    data: {
      vendorId: ownerVendorId,
      customerId: customer.id,
      totalAmount: 120,
      itemCount: 2,
      status: 'PENDING_FULFILLMENT',
    },
  });
  createdOrderIds.push(o.id);
  orderId = o.id;

  const item = await prisma.storeOrderItem.create({
    data: {
      orderId: o.id,
      productId: p.id,
      nameSnapshot: { ar: 'منتج إي٢', en: 'E2 product' },
      priceSnapshot: 60,
      quantity: 2,
    },
  });
  itemId = item.id;

  await prisma.dispute.create({
    data: { storeOrderId: o.id, raisedBy: customer.id, reason: 'Missing item', status: 'OPEN' },
  });
}, 30000);

afterAll(async () => {
  await prisma.dispute.deleteMany({ where: { storeOrderId: { in: createdOrderIds } } });
  await prisma.storeOrderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendorStaff.deleteMany({ where: { id: { in: createdStaffIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('E2 — orderDetail', () => {
  it('returns the order with line items, customer summary and its dispute', async () => {
    const c = await caller(owner);
    const order = await c.vendorPortal.orderDetail({ orderId });
    expect(order.id).toBe(orderId);
    expect(order.vendorId).toBe(ownerVendorId);
    expect(order.items).toHaveLength(1);
    expect(order.items[0]!.id).toBe(itemId);
    expect(order.items[0]!.quantity).toBe(2);
    expect(order.customer?.name).toBeTruthy();
    expect(order.dispute?.reason).toBe('Missing item');
  });

  it('lets a staff member with ORDERS_MANAGE fetch the order', async () => {
    const c = await caller(clerk);
    const order = await c.vendorPortal.orderDetail({ orderId });
    expect(order.id).toBe(orderId);
  });

  it('rejects another vendor with NOT_FOUND (no cross-store reads)', async () => {
    const c = await caller(outsider);
    await expect(c.vendorPortal.orderDetail({ orderId })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('rejects a customer with NOT_FOUND', async () => {
    const c = await caller(customer);
    await expect(c.vendorPortal.orderDetail({ orderId })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('rejects an unknown order id with NOT_FOUND', async () => {
    const c = await caller(owner);
    await expect(c.vendorPortal.orderDetail({ orderId: orderId + 999_999 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
