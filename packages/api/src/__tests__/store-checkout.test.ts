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
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: customer.id, productId } },
    update: { quantity },
    create: { userId: customer.id, productId, quantity },
  });
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

describe('buyCart regression', () => {
  it('still creates orders without a checkoutId', async () => {
    await seedCart(1);
    const caller = await authCaller(customer);
    const result = await caller.marketplace.buyCart({});
    expect(result.success).toBe(true);

    const orders = await prisma.storeOrder.findMany({
      where: { customerId: customer.id, checkoutId: null },
    });
    expect(orders.length).toBeGreaterThanOrEqual(1);
    orders.forEach((o) => createdOrderIds.push(o.id));
  });
});
