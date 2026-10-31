/**
 * Store checkout (MyFatoorah shipping + payment) integration tests —
 * payCart wallet path, insufficient-balance rollback, online invoice-link
 * path, verifyCartPayment status transitions, idempotency, and the
 * buyCart regression (orders still creatable without a checkout).
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { prisma, Prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildVendor, buildProduct } from './factories';
import { calculateShippingCharge, sendPayment, getPaymentStatus } from '../lib/fatoorah';

vi.mock('../lib/fatoorah', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/fatoorah')>();
  return {
    ...actual,
    calculateShippingCharge: vi.fn(),
    sendPayment: vi.fn(),
    getPaymentStatus: vi.fn(),
  };
});

const chargeMock = vi.mocked(calculateShippingCharge);
const sendMock = vi.mocked(sendPayment);
const statusMock = vi.mocked(getPaymentStatus);

const CSRF = 'a'.repeat(64);

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let productId: number;
let vendorOwnerId: number;
const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdProductIds: number[] = [];
const createdCheckoutIds: number[] = [];
const createdOrderIds: number[] = [];
const createdTxnIds: number[] = [];

const SHIPPING = {
  personName: 'Saeed Test',
  mobile: '0500000000',
  lineAddress: 'Test Street 1',
  cityName: 'RIYADH',
  postalCode: '12345',
  countryCode: 'SA',
  shippingMethod: 1 as const,
};

async function seedCart(quantity = 1): Promise<void> {
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

/** Earlier tests in this file consume the product stock — top up. */
async function restock() {
  await prisma.product.update({ where: { id: productId }, data: { stock: 100 } });
}

/** Track every order of a checkout for teardown — StoreOrderItem rows keep
 *  the product FK (Restrict) alive until their orders are deleted. */
async function trackOrdersFor(checkoutId: number): Promise<void> {
  const orders = await prisma.storeOrder.findMany({ where: { checkoutId } });
  orders.forEach((o) => createdOrderIds.push(o.id));
}

beforeEach(() => {
  vi.clearAllMocks();
});

beforeAll(async () => {
  const anonCtx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  const anon = (appRouter as any).createCaller(anonCtx);
  const login = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  customer = { id: login.user.id, role: login.user.role, email: login.user.email };

  const vendorUser = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(vendorUser.id);
  vendorOwnerId = vendorUser.id;
  const vendor = await prisma.vendor.create({ data: buildVendor({ userId: vendorUser.id }) });
  createdVendorIds.push(vendor.id);
  const cat = await prisma.productCategory.create({
    data: {
      nameJson: { ar: 'منتجات', en: 'Products' },
      slug: `store-checkout-cat-${Date.now()}`,
    },
  });
  createdCategoryIds.push(cat.id);
  const product = await prisma.product.create({
    data: buildProduct({
      vendorId: vendor.id,
      categoryId: cat.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      price: 100,
    }),
  });
  productId = product.id;
  createdProductIds.push(product.id);
}, 15000);

afterAll(async () => {
  await prisma.walletTransaction.deleteMany({ where: { id: { in: createdTxnIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.storeCheckout.deleteMany({ where: { id: { in: createdCheckoutIds } } });
  await prisma.cartItem.deleteMany({ where: { userId: customer.id } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  vi.clearAllMocks();
});

describe('payCart — wallet path', () => {
  it('creates a PAID checkout, orders with checkoutId, debits the wallet, clears the cart', async () => {
    await seedCart(2);
    const wallet = await prisma.wallet.upsert({
      where: { userId: customer.id },
      create: { userId: customer.id, balance: new Prisma.Decimal(1000) },
      update: { balance: new Prisma.Decimal(1000) },
    });
    chargeMock.mockResolvedValue({ shippingCharge: 15 });

    const caller = await authCaller(customer);
    const result = await caller.payments.payCart({
      idempotencyKey: `sc_${Date.now()}_w1`,
      method: 'wallet',
      shipping: SHIPPING,
    });

    expect(result.status).toBe('PAID');
    expect(result.method).toBe('wallet');
    expect(Number(result.total)).toBe(215); // 2×100 + 15
    createdCheckoutIds.push(result.checkoutId);

    const checkout = await prisma.storeCheckout.findUnique({ where: { id: result.checkoutId } });
    expect(checkout?.status).toBe('PAID');
    expect(Number(checkout?.shippingCharge)).toBe(15);
    expect(checkout?.shipCityName).toBe('RIYADH');

    const orders = await prisma.storeOrder.findMany({ where: { checkoutId: result.checkoutId } });
    expect(orders).toHaveLength(1);
    orders.forEach((o) => createdOrderIds.push(o.id));
    expect(Number(orders[0]?.totalAmount)).toBe(200);

    const walletAfter = await prisma.wallet.findUnique({ where: { id: wallet.id } });
    expect(Number(walletAfter?.balance)).toBe(785);

    const txn = await prisma.walletTransaction.findFirst({
      where: { referenceId: `store_checkout_${result.checkoutId}`, source: 'STORE_PURCHASE' },
    });
    expect(txn).not.toBeNull();
    if (txn) createdTxnIds.push(txn.id);
    expect(txn?.type).toBe('DEBIT');

    const cart = await prisma.cartItem.findMany({ where: { userId: customer.id } });
    expect(cart).toHaveLength(0);
  });

  it('B0 — places per-line StoreOrderItems with name/price snapshots', async () => {
    await seedCart(1);
    await prisma.wallet.upsert({
      where: { userId: customer.id },
      create: { userId: customer.id, balance: new Prisma.Decimal(1000) },
      update: { balance: new Prisma.Decimal(1000) },
    });
    chargeMock.mockResolvedValue({ shippingCharge: 0 });

    const caller = await authCaller(customer);
    const result = await caller.payments.payCart({
      idempotencyKey: `sc_${Date.now()}_items`,
      method: 'wallet',
      shipping: SHIPPING,
    });
    createdCheckoutIds.push(result.checkoutId);

    const order = await prisma.storeOrder.findFirst({
      where: { checkoutId: result.checkoutId },
      include: { items: true },
    });
    expect(order).not.toBeNull();
    createdOrderIds.push(order!.id);

    expect(order!.items).toHaveLength(1);
    expect(order!.items[0]).toMatchObject({
      productId,
      quantity: 1,
      priceSnapshot: new Prisma.Decimal('100'),
    });
    expect((order!.items[0]!.nameSnapshot as { ar?: string }).ar).toBe('سيروم');
  });

  it('rolls everything back on insufficient wallet balance', async () => {
    await seedCart(1);
    await prisma.wallet.upsert({
      where: { userId: customer.id },
      create: { userId: customer.id, balance: new Prisma.Decimal(0) },
      update: { balance: new Prisma.Decimal(0) },
    });
    chargeMock.mockResolvedValue({ shippingCharge: 15 });

    const key = `sc_${Date.now()}_w2`;
    const caller = await authCaller(customer);
    await expect(
      caller.payments.payCart({
        idempotencyKey: key,
        method: 'wallet',
        shipping: SHIPPING,
      }),
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });

    const checkouts = await prisma.storeCheckout.findMany({ where: { idempotencyKey: key } });
    expect(checkouts).toHaveLength(0);
    // Cart preserved for correction.
    const cart = await prisma.cartItem.findMany({ where: { userId: customer.id } });
    expect(cart).toHaveLength(1);
    await prisma.cartItem.deleteMany({ where: { userId: customer.id } });
  });
});

describe('payCart — online invoice-link path', () => {
  it('creates a PENDING checkout and returns the invoice URL', async () => {
    await seedCart(1);
    chargeMock.mockResolvedValue({ shippingCharge: 25 });
    sendMock.mockResolvedValue({
      invoiceId: 'INV-SC-1',
      invoiceURL: 'https://apitest.myfatoorah.com/INV-SC-1',
    });

    const caller = await authCaller(customer);
    const result = await caller.payments.payCart({
      idempotencyKey: `sc_${Date.now()}_o1`,
      method: 'online',
      shipping: SHIPPING,
    });

    expect(result.status).toBe('PENDING');
    expect(result.invoiceURL).toBe('https://apitest.myfatoorah.com/INV-SC-1');
    expect(result.invoiceId).toBe('INV-SC-1');
    createdCheckoutIds.push(result.checkoutId);
    await trackOrdersFor(result.checkoutId);

    const checkout = await prisma.storeCheckout.findUnique({ where: { id: result.checkoutId } });
    expect(checkout?.invoiceId).toBe('INV-SC-1');
    expect(checkout?.gatewayRef).toBe('INV-SC-1');

    // The invoice request carried the shipping consignee.
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customerReference: `GOB-CHECKOUT-${result.checkoutId}`,
        shippingConsignee: expect.objectContaining({ cityName: 'RIYADH' }),
      }),
    );
  });

  it('marks the checkout PAID only after gateway verification', async () => {
    await seedCart(1);
    chargeMock.mockResolvedValue({ shippingCharge: 25 });
    sendMock.mockResolvedValue({
      invoiceId: 'INV-SC-2',
      invoiceURL: 'https://apitest.myfatoorah.com/INV-SC-2',
    });

    const caller = await authCaller(customer);
    const created = await caller.payments.payCart({
      idempotencyKey: `sc_${Date.now()}_o2`,
      method: 'online',
      shipping: SHIPPING,
    });
    createdCheckoutIds.push(created.checkoutId);
    await trackOrdersFor(created.checkoutId);

    // Pending status from the gateway → still PENDING.
    statusMock.mockResolvedValue({ invoiceId: 'INV-SC-2', invoiceStatus: 'Pending' });
    const pending = await caller.payments.verifyCartPayment({ invoiceId: 'INV-SC-2' });
    expect(pending.status).toBe('PENDING');

    // Paid status from the gateway → PAID.
    statusMock.mockResolvedValue({ invoiceId: 'INV-SC-2', invoiceStatus: 'Paid' });
    const paid = await caller.payments.verifyCartPayment({ invoiceId: 'INV-SC-2' });
    expect(paid.status).toBe('PAID');
    const checkout = await prisma.storeCheckout.findUnique({
      where: { id: created.checkoutId },
    });
    expect(checkout?.status).toBe('PAID');
  });

  it('marks the checkout FAILED on gateway failure status', async () => {
    await seedCart(1);
    chargeMock.mockResolvedValue({ shippingCharge: 25 });
    sendMock.mockResolvedValue({
      invoiceId: 'INV-SC-3',
      invoiceURL: 'https://apitest.myfatoorah.com/INV-SC-3',
    });

    const caller = await authCaller(customer);
    const created = await caller.payments.payCart({
      idempotencyKey: `sc_${Date.now()}_o3`,
      method: 'online',
      shipping: SHIPPING,
    });
    createdCheckoutIds.push(created.checkoutId);
    await trackOrdersFor(created.checkoutId);

    statusMock.mockResolvedValue({ invoiceId: 'INV-SC-3', invoiceStatus: 'Canceled' });
    const failed = await caller.payments.verifyCartPayment({ invoiceId: 'INV-SC-3' });
    expect(failed.status).toBe('FAILED');
    const checkout = await prisma.storeCheckout.findUnique({
      where: { id: created.checkoutId },
    });
    expect(checkout?.status).toBe('FAILED');
  });
});

describe('payCart — idempotency', () => {
  it('returns the same checkout for a duplicate key without double-charging', async () => {
    await seedCart(1);
    chargeMock.mockResolvedValue({ shippingCharge: 25 });
    sendMock.mockResolvedValue({
      invoiceId: 'INV-SC-4',
      invoiceURL: 'https://apitest.myfatoorah.com/INV-SC-4',
    });

    const key = `sc_${Date.now()}_idem`;
    const caller = await authCaller(customer);
    const first = await caller.payments.payCart({
      idempotencyKey: key,
      method: 'online',
      shipping: SHIPPING,
    });
    createdCheckoutIds.push(first.checkoutId);
    await trackOrdersFor(first.checkoutId);
    const second = await caller.payments.payCart({
      idempotencyKey: key,
      method: 'online',
      shipping: SHIPPING,
    });
    expect(second.checkoutId).toBe(first.checkoutId);
    expect(sendMock).toHaveBeenCalledTimes(1);

    const count = await prisma.storeCheckout.count({ where: { idempotencyKey: key } });
    expect(count).toBe(1);
  });
});

describe('A5 — the unpaid purchase endpoint is gone', () => {
  it('marketplace no longer exposes buyCart (audit M3)', async () => {
    // The createCaller proxy cannot prove absence statically — CALLING
    // the removed procedure must throw.
    const c = await authCaller(customer);
    await expect(
      (c.marketplace as Record<string, unknown>).buyCart as unknown as () => Promise<unknown>,
    ).rejects.toThrow();
  });
});

/** A5 — create a PENDING_FULFILLMENT order with NO checkout (the exact
 *  state buyCart used to produce) so the payment gates can be tested. */
async function createCheckoutlessOrder(): Promise<{ id: number }> {
  // The file's own vendor (vendorOwnerId) — vendorCaller() must own the
  // order or the ownership guard masks the payment-gate assertion.
  const vendor = await prisma.vendor.findFirstOrThrow({
    where: { userId: vendorOwnerId },
  });
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const order = await prisma.storeOrder.create({
    data: {
      vendorId: vendor.id,
      customerId: customer.id,
      totalAmount: Number(product.price),
      itemCount: 1,
      status: 'PENDING_FULFILLMENT',
    },
  });
  await prisma.storeOrderItem.create({
    data: {
      orderId: order.id,
      productId,
      nameSnapshot: (product.nameJson ?? {}) as object,
      priceSnapshot: product.price,
      quantity: 1,
    },
  });
  createdOrderIds.push(order.id);
  return order;
}

describe('A2 — payment gates on fulfillment and cancel', () => {
  async function vendorCaller() {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: vendorOwnerId } });
    return authCaller({ id: user.id, role: 'CUSTOMER', email: user.email });
  }

  /** Earlier tests in this file consume the product stock — top up. */
  async function restock() {
    await prisma.product.update({ where: { id: productId }, data: { stock: 100 } });
  }

  it('fulfillOrder rejects an order with no checkout (audit M2)', async () => {
    await restock();
    await seedCart(1);
    const c = await authCaller(customer);
    const order = await createCheckoutlessOrder();

    const vc = await vendorCaller();
    await expect(vc.vendorPortal.fulfillOrder({ orderId: order.id })).rejects.toMatchObject({
      code: 'PRECONDITION_FAILED',
    });
  });

  it('fulfillOrder rejects an order whose checkout is not PAID (audit M2)', async () => {
    await restock();
    await seedCart(1);
    const c = await authCaller(customer);
    const order = await createCheckoutlessOrder();

    // Attach a PENDING (unpaid) online checkout — stock exists, money does not.
    const checkout = await prisma.storeCheckout.create({
      data: {
        customerId: customer.id,
        idempotencyKey: `a2_pending_${order.id}`,
        method: 'online',
        subtotal: order.totalAmount,
        total: order.totalAmount,
        status: 'PENDING',
        shipPersonName: 'Test',
        shipMobile: '0500000000',
        shipLineAddress: 'Test Street',
        shipCityName: 'RIYADH',
        shipPostalCode: '12345',
        shipCountryCode: 'SA',
      },
    });
    createdCheckoutIds.push(checkout.id);
    await prisma.storeOrder.update({ where: { id: order.id }, data: { checkoutId: checkout.id } });

    const vc = await vendorCaller();
    await expect(vc.vendorPortal.fulfillOrder({ orderId: order.id })).rejects.toMatchObject({
      code: 'PRECONDITION_FAILED',
    });
  });

  it('cancelOrder on a checkout-less order refunds nothing (audit M4 — no money mint)', async () => {
    await restock();
    await seedCart(1);
    const c = await authCaller(customer);
    const order = await createCheckoutlessOrder();

    const wallet = await prisma.wallet.upsert({
      where: { userId: customer.id },
      create: { userId: customer.id, balance: new Prisma.Decimal(0) },
      update: {},
    });
    const balanceBefore = Number(wallet.balance);

    const vc = await vendorCaller();
    const cancelled = await vc.vendorPortal.cancelOrder({ orderId: order.id });
    expect(cancelled.status).toBe('CANCELLED');

    const after = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });
    expect(Number(after.balance)).toBe(balanceBefore);
  });
});

describe('A3 — checkout compensation and overdraw guard', () => {
  it('compensates the placement when the gateway rejects the invoice', async () => {
    await restock();
    await seedCart(2);
    chargeMock.mockResolvedValue({ shippingCharge: 15 });
    sendMock.mockRejectedValue(new Error('gateway down'));

    const before = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    const vendorBefore = await prisma.vendor.findFirstOrThrow({
      where: { id: before.vendorId },
    });

    const caller = await authCaller(customer);
    const idempotencyKey = `sc_${Date.now()}_fail1`;
    await expect(
      caller.payments.payCart({ idempotencyKey, method: 'online', shipping: SHIPPING }),
    ).rejects.toThrow();

    // Checkout FAILED, orders CANCELLED, stock/sales/vendor totals restored.
    const checkout = await prisma.storeCheckout.findUniqueOrThrow({
      where: { idempotencyKey },
    });
    createdCheckoutIds.push(checkout.id);
    expect(checkout.status).toBe('FAILED');

    const orders = await prisma.storeOrder.findMany({ where: { checkoutId: checkout.id } });
    expect(orders.length).toBeGreaterThanOrEqual(1);
    expect(orders.every((o) => o.status === 'CANCELLED')).toBe(true);
    orders.forEach((o) => createdOrderIds.push(o.id));

    const after = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(after.stock).toBe(before.stock);
    expect(after.sales).toBe(before.sales);

    const vendorAfter = await prisma.vendor.findFirstOrThrow({ where: { id: before.vendorId } });
    expect(Number(vendorAfter.totalSales)).toBe(Number(vendorBefore.totalSales));
  });

  it('refuses a wallet checkout that would overdraw (atomic balance check)', async () => {
    await restock();
    await seedCart(1);
    await prisma.wallet.upsert({
      where: { userId: customer.id },
      create: { userId: customer.id, balance: new Prisma.Decimal(100) },
      update: { balance: new Prisma.Decimal(100) },
    });
    chargeMock.mockResolvedValue({ shippingCharge: 0 });

    const caller = await authCaller(customer);
    const first = await caller.payments.payCart({
      idempotencyKey: `sc_${Date.now()}_ov1`,
      method: 'wallet',
      shipping: SHIPPING,
    });
    expect(first.status).toBe('PAID');
    createdCheckoutIds.push(first.checkoutId);
    await trackOrdersFor(first.checkoutId);

    // Second purchase with the now-empty wallet must reject without
    // going negative (audit M6).
    await restock();
    await seedCart(1);
    await expect(
      caller.payments.payCart({
        idempotencyKey: `sc_${Date.now()}_ov2`,
        method: 'wallet',
        shipping: SHIPPING,
      }),
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });

    const after = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });
    expect(Number(after.balance)).toBe(0);
  });
});
