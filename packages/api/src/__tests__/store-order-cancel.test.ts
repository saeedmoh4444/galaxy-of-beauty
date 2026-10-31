/**
 * B2a — store order cancellation (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
 * Cancel-before-fulfillment restores stock/sales (reversing the
 * checkout-time decrement) and refunds wallet-paid customers immediately;
 * online-paid orders stay CANCELLED with the refund deferred to the live
 * Fatoorah API (B5, user-gated) — mirroring the dispute refund convention.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const CSRF = 'a'.repeat(64);

async function caller(user?: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let owner: JwtPayload;
let customer: JwtPayload;
let outsider: JwtPayload;
let vendorId: number;
let productId: number;
let categoryId: number;
const userIds: number[] = [];
const vendorIds: number[] = [];
const orderIds: number[] = [];
const checkoutIds: number[] = [];

/** Create a PENDING_FULFILLMENT order as if purchased (stock/sales moved). */
async function createPurchasedOrder(opts: { method?: 'wallet' | 'online'; total?: number } = {}) {
  const total = opts.total ?? 100;
  let checkoutId: number | null = null;
  if (opts.method) {
    const checkout = await prisma.storeCheckout.create({
      data: {
        customerId: customer.id,
        idempotencyKey: `cancel-t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        method: opts.method,
        subtotal: total,
        total,
        status: 'PAID',
        shipPersonName: 'Test',
        shipMobile: '0500000000',
        shipLineAddress: 'Test Street',
        shipCityName: 'RIYADH',
        shipPostalCode: '12345',
        shipCountryCode: 'SA',
      },
    });
    checkoutIds.push(checkout.id);
    checkoutId = checkout.id;
  }
  const order = await prisma.storeOrder.create({
    data: {
      vendorId,
      customerId: customer.id,
      checkoutId,
      totalAmount: total,
      itemCount: 1,
      status: 'PENDING_FULFILLMENT',
    },
  });
  orderIds.push(order.id);
  await prisma.storeOrderItem.create({
    data: {
      orderId: order.id,
      productId,
      nameSnapshot: { ar: 'سيروم', en: 'Serum' },
      priceSnapshot: total,
      quantity: 1,
    },
  });
  // Checkout-time effects (placeStoreOrders equivalent).
  await prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: 1 }, sales: { increment: 1 } },
  });
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { totalSales: { increment: total } },
  });
  return order;
}

describe('store order cancellation (B2a)', { sequential: true }, () => {
  beforeAll(async () => {
    const o = await prisma.user.create({ data: buildUser() });
    const c = await prisma.user.create({ data: buildUser() });
    const x = await prisma.user.create({ data: buildUser() });
    userIds.push(o.id, c.id, x.id);
    owner = { id: o.id, role: 'CUSTOMER', email: o.email };
    customer = { id: c.id, role: 'CUSTOMER', email: c.email };
    outsider = { id: x.id, role: 'CUSTOMER', email: x.email };

    await prisma.wallet.create({ data: { userId: c.id, balance: 500 } });

    const vendor = await prisma.vendor.create({
      data: { userId: o.id, storeName: 'متجر الإلغاء', storeSlug: `cancel-${o.id}` },
    });
    vendorId = vendor.id;
    vendorIds.push(vendorId);

    const cat = await prisma.productCategory.create({
      data: { nameJson: { ar: 'منتجات', en: 'Products' }, slug: `cancel-cat-${Date.now()}` },
    });
    categoryId = cat.id;

    const product = await prisma.product.create({
      data: {
        vendorId,
        categoryId,
        nameJson: { ar: 'سيروم', en: 'Serum' },
        descriptionJson: { ar: '', en: '' },
        price: 100,
        stock: 10,
        sales: 0,
      },
    });
    productId = product.id;
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.storeOrderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    } catch {}
    try {
      await prisma.storeOrder.deleteMany({ where: { id: { in: orderIds } } });
    } catch {}
    try {
      await prisma.storeCheckout.deleteMany({ where: { id: { in: checkoutIds } } });
    } catch {}
    try {
      // Scope the cleanup to THIS suite's refund transactions — an unscoped
      // delete would wipe other suites' wallet rows in the shared test DB.
      await prisma.walletTransaction.deleteMany({
        where: { referenceId: { in: orderIds.map(String) } },
      });
    } catch {}
    try {
      await prisma.product.deleteMany({ where: { id: productId } });
    } catch {}
    try {
      await prisma.productCategory.deleteMany({ where: { id: categoryId } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: vendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    } catch {}
  });

  it('cancels a pending wallet-paid order: stock/sales restored, wallet credited', async () => {
    const before = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    const stockAfterPurchase = before.stock; // will be decremented by the helper
    const order = await createPurchasedOrder({ method: 'wallet', total: 100 });

    const walletBefore = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });
    const balanceBefore = Number(walletBefore.balance);

    const ownerCaller = await caller(owner);
    const cancelled = await ownerCaller.vendorPortal.cancelOrder({ orderId: order.id });
    expect(cancelled.status).toBe('CANCELLED');

    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(product.stock).toBe(stockAfterPurchase); // decremented once, restored once
    expect(product.sales).toBe(0);

    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
    expect(Number(vendor.totalSales)).toBe(0);

    const walletAfter = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });
    expect(Number(walletAfter.balance)).toBe(balanceBefore + 100);

    const txn = await prisma.walletTransaction.findFirst({
      where: { referenceId: String(order.id), source: 'REFUND', type: 'CREDIT' },
    });
    expect(txn).toBeTruthy();
    expect(Number(txn!.amount)).toBe(100);
  });

  it('a second cancel attempt fails without double-restoring', async () => {
    const order = await createPurchasedOrder({ method: 'wallet', total: 60 });
    const ownerCaller = await caller(owner);
    await ownerCaller.vendorPortal.cancelOrder({ orderId: order.id });

    const stockAfterCancel = (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
      .stock;

    await expect(ownerCaller.vendorPortal.cancelOrder({ orderId: order.id })).rejects.toThrow(
      /cannot be cancelled/i,
    );

    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(product.stock).toBe(stockAfterCancel); // untouched by the failed retry
  });

  it('a FULFILLED order cannot be cancelled', async () => {
    const order = await prisma.storeOrder.create({
      data: { vendorId, customerId: customer.id, totalAmount: 70, status: 'FULFILLED' },
    });
    orderIds.push(order.id);

    const ownerCaller = await caller(owner);
    await expect(ownerCaller.vendorPortal.cancelOrder({ orderId: order.id })).rejects.toThrow(
      /cannot be cancelled/i,
    );
  });

  it('an online-paid order cancels but the wallet is not credited (refund deferred)', async () => {
    const order = await createPurchasedOrder({ method: 'online', total: 80 });
    const walletBefore = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });

    const ownerCaller = await caller(owner);
    const cancelled = await ownerCaller.vendorPortal.cancelOrder({ orderId: order.id });
    expect(cancelled.status).toBe('CANCELLED');

    const walletAfter = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });
    expect(Number(walletAfter.balance)).toBe(Number(walletBefore.balance));
  });

  it('a non-owner cannot cancel the order', async () => {
    const order = await createPurchasedOrder({ method: 'wallet', total: 40 });
    const outsiderCaller = await caller(outsider);
    await expect(outsiderCaller.vendorPortal.cancelOrder({ orderId: order.id })).rejects.toThrow(
      /Store not found|Order not found/i,
    );
  });

  it('cancelling a variant line restores variant stock, not base stock (audit M12)', async () => {
    const variant = await prisma.productVariant.create({
      data: {
        productId,
        nameJson: { ar: '٥٠ مل', en: '50ml' },
        priceDelta: 5,
        stock: 10,
        isActive: true,
      },
    });
    // Earlier tests in this file can leak sales (a rejected cancel never
    // reverses its fixture increment) — capture the baselines BEFORE the
    // simulated placement and assert the RELATIVE change.
    const baseline = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    const baseStockBefore = baseline.stock;
    const salesBefore = baseline.sales;

    // Simulate the placement effects: variant stock down, sales up.
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { stock: { decrement: 2 } },
    });
    await prisma.product.update({
      where: { id: productId },
      data: { sales: { increment: 2 } },
    });

    const order = await prisma.storeOrder.create({
      data: {
        vendorId,
        customerId: customer.id,
        totalAmount: 60,
        itemCount: 2,
        status: 'PENDING_FULFILLMENT',
      },
    });
    orderIds.push(order.id);
    await prisma.storeOrderItem.create({
      data: {
        orderId: order.id,
        productId,
        variantId: variant.id,
        nameSnapshot: { ar: 'سيروم', en: 'Serum' },
        priceSnapshot: 30,
        quantity: 2,
      },
    });

    const ownerCaller = await caller(owner);
    const cancelled = await ownerCaller.vendorPortal.cancelOrder({ orderId: order.id });
    expect(cancelled.status).toBe('CANCELLED');

    const afterVariant = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variant.id },
    });
    expect(afterVariant.stock).toBe(10); // variant stock restored
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(product.stock).toBe(baseStockBefore); // base stock untouched
    expect(product.sales).toBe(salesBefore); // sales reversed back to baseline
  });
});
