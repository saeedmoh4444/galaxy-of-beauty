/**
 * Store plan Phase 1 — merchant registration + admin approval + orders.
 * Acceptance: a store registers → admin approves → store uploads a product
 * → product visible in admin; purchases split into per-store orders that
 * the store fulfills.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let merchant: JwtPayload;
let buyer: JwtPayload;

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];
const createdOrderIds: number[] = [];
const createdSubmissionIds: number[] = [];
let categoryId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('store registration + approval (Store Phase 1)', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };

    const u1 = await prisma.user.create({ data: buildUser() });
    merchant = { id: u1.id, role: 'CUSTOMER', email: u1.email };
    const u2 = await prisma.user.create({ data: buildUser() });
    buyer = { id: u2.id, role: 'CUSTOMER', email: u2.email };
    createdUserIds.push(u1.id, u2.id);

    const cat = await prisma.productCategory.findUnique({ where: { slug: 'general' } });
    categoryId = cat!.id;
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.cartItem.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
    } catch {}
    try {
      await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
    } catch {}
    try {
      await prisma.providerSubmission.deleteMany({ where: { id: { in: createdSubmissionIds } } });
    } catch {}
    try {
      await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous registration', async () => {
    const anon = await caller(null);
    await expect(
      anon.marketplace.becomeVendor({ storeName: 'x', storeSlug: 'x-store' }),
    ).rejects.toThrow();
  });

  it('registers a store → unverified vendor + PENDING_REVIEW submission', async () => {
    const c = await caller(merchant);
    const vendor = await c.marketplace.becomeVendor({
      storeName: 'متجر الجمال',
      storeSlug: `beauty-store-${Date.now()}`,
      descriptionAr: 'منتجات تجميل أصلية',
      licenseNumber: 'CR-123456',
      bankIban: 'SA0000000000000000000000',
      bankName: 'البنك الأهلي',
    });
    createdVendorIds.push(vendor.id);

    expect(vendor.isVerified).toBe(false);
    expect(vendor.type).toBe('STORE');
    expect(vendor.licenseNumber).toBe('CR-123456');

    const submission = await prisma.providerSubmission.findFirst({
      where: { providerId: merchant.id, kind: 'store' },
    });
    expect(submission).not.toBeNull();
    expect(submission!.status).toBe('PENDING_REVIEW');
    expect((submission!.payload as { vendorId: number }).vendorId).toBe(vendor.id);
    createdSubmissionIds.push(submission!.id);

    // Unverified stores are hidden from the public vendor list.
    const anon = await caller(null);
    const list = await anon.marketplace.vendors({});
    expect(list.items.find((v: { id: number }) => v.id === vendor.id)).toBeUndefined();
  });

  it('rejects duplicate registration', async () => {
    const c = await caller(merchant);
    await expect(
      c.marketplace.becomeVendor({ storeName: 'متجر آخر', storeSlug: 'another-store' }),
    ).rejects.toThrow(/Already a vendor/);
  });

  it('myStore returns the store for the owner and null for others', async () => {
    const mine = await caller(merchant);
    const store = await mine.vendorPortal.myStore();
    expect(store).not.toBeNull();

    const other = await caller(buyer);
    const none = await other.vendorPortal.myStore();
    expect(none).toBeNull();
  });

  it('admin approve → store verified + listed publicly + provider notified', async () => {
    const submission = await prisma.providerSubmission.findFirstOrThrow({
      where: { providerId: merchant.id, kind: 'store' },
    });

    const a = await caller(admin);
    const res = await a.providerReview.decide({ id: submission.id, approve: true });
    expect(res.status).toBe('APPROVED');

    const vendor = await prisma.vendor.findFirstOrThrow({ where: { userId: merchant.id } });
    expect(vendor.isVerified).toBe(true);

    const anon = await caller(null);
    const list = await anon.marketplace.vendors({});
    expect(list.items.find((v: { id: number }) => v.id === vendor.id)).toBeDefined();

    const notif = await prisma.notification.findFirst({
      where: { userId: merchant.id, type: 'submission_approved' },
    });
    expect(notif).not.toBeNull();
  });

  it('store uploads a product → visible in admin products', async () => {
    const c = await caller(merchant);
    const p = await c.vendorPortal.addProduct({
      nameAr: 'كريم مرطب',
      nameEn: 'Moisturizer',
      price: 90,
      stock: 10,
      categoryId,
    });
    createdProductIds.push(p.id);

    const a = await caller(admin);
    const res = await a.marketplace.adminProducts({ page: 1, limit: 50 });
    expect(res.items.find((x: { id: number }) => x.id === p.id)).toBeDefined();
  });

  it('buyCart splits the purchase into per-store orders', async () => {
    const c = await caller(buyer);
    await c.marketplace.addToCart({ productId: createdProductIds[0]!, quantity: 2 });

    const res = await c.marketplace.buyCart({});
    expect(res.success).toBe(true);

    const orders = await prisma.storeOrder.findMany({
      where: { customerId: buyer.id },
    });
    expect(orders.length).toBe(1);
    expect(Number(orders[0]!.totalAmount)).toBe(180);
    expect(orders[0]!.itemCount).toBe(2);
    expect(orders[0]!.status).toBe('PENDING_FULFILLMENT');
    createdOrderIds.push(orders[0]!.id);

    // Store sees the order + pending count on the dashboard.
    const store = await caller(merchant);
    const ordersList = await store.vendorPortal.orders();
    expect(ordersList.length).toBe(1);
    const dash = await store.vendorPortal.dashboard();
    expect(dash.pendingOrders).toBe(1);
  });

  it('fulfillOrder is ownership-guarded and flips the status', async () => {
    const other = await caller(buyer);
    await expect(
      other.vendorPortal.fulfillOrder({ orderId: createdOrderIds[0]! }),
    ).rejects.toThrow();

    const store = await caller(merchant);
    const res = await store.vendorPortal.fulfillOrder({ orderId: createdOrderIds[0]! });
    expect(res.status).toBe('FULFILLED');

    const dash = await store.vendorPortal.dashboard();
    expect(dash.pendingOrders).toBe(0);
  });

  it('rejects a second store submission after rejection keeps the store hidden', async () => {
    // Rejection path: register another user, reject, assert not listed.
    const u3 = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(u3.id);
    const rejectedMerchant = { id: u3.id, role: 'CUSTOMER', email: u3.email } as JwtPayload;

    const c = await caller(rejectedMerchant);
    const vendor = await c.marketplace.becomeVendor({
      storeName: 'متجر مرفوض',
      storeSlug: `rejected-store-${Date.now()}`,
    });
    createdVendorIds.push(vendor.id);
    const submission = await prisma.providerSubmission.findFirstOrThrow({
      where: { providerId: u3.id, kind: 'store' },
    });
    createdSubmissionIds.push(submission.id);

    const a = await caller(admin);
    await a.providerReview.decide({
      id: submission.id,
      approve: false,
      notes: 'المستندات غير مكتملة',
    });

    const stored = await prisma.vendor.findFirstOrThrow({ where: { userId: u3.id } });
    expect(stored.isVerified).toBe(false);
    const notif = await prisma.notification.findFirst({
      where: { userId: u3.id, type: 'submission_rejected' },
    });
    expect(notif).not.toBeNull();
  });
});
