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
      // Phase 3 accrual rows — delete before the vendors (SET NULL FK).
      await prisma.payout.deleteMany({ where: { vendorId: { in: createdVendorIds } } });
    } catch {}
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
      anon.marketplace.becomeVendor({
        storeName: 'x',
        storeSlug: 'x-store',
        licenseNumber: 'CR-1',
        documents: {
          crUrl: 'https://example.com/cr.pdf',
          nationalIdUrl: 'https://example.com/id.pdf',
          bankLetterUrl: 'https://example.com/bank.pdf',
        },
      }),
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
      documents: {
        crUrl: 'https://example.com/cr.pdf',
        nationalIdUrl: 'https://example.com/id.pdf',
        bankLetterUrl: 'https://example.com/bank.pdf',
      },
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
      c.marketplace.becomeVendor({
        storeName: 'متجر آخر',
        storeSlug: 'another-store',
        licenseNumber: 'CR-1',
        documents: {
          crUrl: 'https://example.com/cr.pdf',
          nationalIdUrl: 'https://example.com/id.pdf',
          bankLetterUrl: 'https://example.com/bank.pdf',
        },
      }),
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
      licenseNumber: 'CR-999',
      documents: {
        crUrl: 'https://example.com/cr.pdf',
        nationalIdUrl: 'https://example.com/id.pdf',
        bankLetterUrl: 'https://example.com/bank.pdf',
      },
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

  it('Phase 2 acceptance: two stores in one cart → two orders, both stocks decremented', async () => {
    // Second store with its own product.
    const u4 = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(u4.id);
    const vendor2 = await prisma.vendor.create({
      data: {
        userId: u4.id,
        storeName: 'المتجر الثاني',
        storeSlug: `second-store-${Date.now()}`,
        isVerified: true,
        isActive: true,
      },
    });
    createdVendorIds.push(vendor2.id);
    const product2 = await prisma.product.create({
      data: {
        vendorId: vendor2.id,
        categoryId,
        nameJson: { ar: 'منتج المتجر الثاني', en: 'Second store product' },
        descriptionJson: { ar: '', en: '' },
        price: 50,
        stock: 4,
      },
    });
    createdProductIds.push(product2.id);

    // The buyer has orders from an earlier test — scope to this purchase
    // by creation time; stocks were decremented before, so assert deltas.
    const testStart = new Date();
    const p1Before = await prisma.product.findUniqueOrThrow({
      where: { id: createdProductIds[0]! },
    });
    const p2Before = await prisma.product.findUniqueOrThrow({
      where: { id: product2.id },
    });
    const c = await caller(buyer);
    await c.marketplace.addToCart({ productId: createdProductIds[0]!, quantity: 1 }); // store 1
    await c.marketplace.addToCart({ productId: product2.id, quantity: 2 }); // store 2

    const res = await c.marketplace.buyCart({});
    expect(res.success).toBe(true);

    const orders = await prisma.storeOrder.findMany({
      where: {
        customerId: buyer.id,
        createdAt: { gte: testStart },
      },
    });
    expect(orders.length).toBe(2);
    const store1Order = orders.find((o) => o.vendorId !== vendor2.id)!;
    const store2Order = orders.find((o) => o.vendorId === vendor2.id)!;
    expect(Number(store1Order.totalAmount)).toBe(90);
    expect(Number(store2Order.totalAmount)).toBe(100);
    expect(store2Order.itemCount).toBe(2);
    createdOrderIds.push(store1Order.id, store2Order.id);

    const p1 = await prisma.product.findUniqueOrThrow({ where: { id: createdProductIds[0]! } });
    const p2 = await prisma.product.findUniqueOrThrow({ where: { id: product2.id } });
    expect(p1.stock).toBe(p1Before.stock - 1);
    expect(p2.stock).toBe(p2Before.stock - 2);
  });

  // ---- Store plan Phase 3 — commissions + payout accrual ----

  it('fulfilling an order accrues a PENDING payout (net = total − commission)', async () => {
    // Fresh order for a deterministic accrual.
    const c = await caller(buyer);
    await c.marketplace.addToCart({ productId: createdProductIds[0]!, quantity: 1 });
    await c.marketplace.buyCart({});

    const order = await prisma.storeOrder.findFirstOrThrow({
      where: { customerId: buyer.id, status: 'PENDING_FULFILLMENT' },
      orderBy: { createdAt: 'desc' },
    });
    createdOrderIds.push(order.id);

    const store = await caller(merchant);
    // An earlier test fulfilled an order — payouts accrued there too.
    const payoutsBefore = await prisma.payout.count({
      where: { vendorId: createdVendorIds[0] },
    });
    await store.vendorPortal.fulfillOrder({ orderId: order.id });

    const payout = await prisma.payout.findFirst({
      where: { vendorId: createdVendorIds[0] },
      orderBy: { createdAt: 'desc' },
    });
    expect(payout).not.toBeNull();
    // Default commission = 10% → net 81, fee 9 (order total was 90 SAR).
    expect(Number(payout!.amount)).toBe(81);
    expect(Number(payout!.fee)).toBe(9);
    expect(payout!.status).toBe('PENDING');
    expect(payout!.technicianId).toBeNull();

    // Idempotency: fulfilling again throws, no second payout.
    await expect(store.vendorPortal.fulfillOrder({ orderId: order.id })).rejects.toThrow(
      /already fulfilled/,
    );
    const count = await prisma.payout.count({ where: { vendorId: createdVendorIds[0] } });
    expect(count).toBe(payoutsBefore + 1);
  });

  it('admin can set a custom commission rate that applies to later payouts', async () => {
    const a = await caller(admin);
    await a.marketplace.adminSetCommission({ vendorId: createdVendorIds[0]!, commissionRate: 20 });

    const vendor = await prisma.vendor.findFirstOrThrow({
      where: { userId: merchant.id },
    });
    expect(Number(vendor.commissionRate)).toBe(20);

    // Buy + fulfill → net = 90 − 18 = 72.
    const c = await caller(buyer);
    await c.marketplace.addToCart({ productId: createdProductIds[0]!, quantity: 1 });
    await c.marketplace.buyCart({});
    const order = await prisma.storeOrder.findFirstOrThrow({
      where: { customerId: buyer.id, status: 'PENDING_FULFILLMENT' },
      orderBy: { createdAt: 'desc' },
    });
    createdOrderIds.push(order.id);

    const store = await caller(merchant);
    await store.vendorPortal.fulfillOrder({ orderId: order.id });

    const payout = await prisma.payout.findFirst({
      where: { vendorId: createdVendorIds[0] },
      orderBy: { createdAt: 'desc' },
    });
    expect(Number(payout!.amount)).toBe(72);
    expect(Number(payout!.fee)).toBe(18);
  });

  it('vendorPortal.earnings lists only the store own payouts', async () => {
    const store = await caller(merchant);
    const mine = await store.vendorPortal.earnings();
    // 1 from the ownership-guard test + 1 from the accrual test + 1 from
    // the commission test = 3 fulfilled orders so far.
    expect(mine.length).toBe(3);
    expect(mine.every((p: { vendorId: number }) => p.vendorId === createdVendorIds[0])).toBe(true);

    const other = await caller(buyer);
    const otherEarnings = await other.vendorPortal.earnings();
    expect(otherEarnings.length).toBe(0);
  });
});
