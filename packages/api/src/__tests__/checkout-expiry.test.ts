/**
 * A3 — abandoned online checkout expiry sweep tests.
 * A PENDING checkout older than CHECKOUT_EXPIRY_MINUTES must be failed
 * with its orders cancelled and the stock/sales restored; fresh PENDING
 * checkouts must be left alone.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { expireAbandonedCheckouts, CHECKOUT_EXPIRY_MINUTES } from '../workers/checkoutExpiry';
import { buildUser, buildVendor, buildProduct } from './factories';

let userId: number;
let vendorId: number;
let productId: number;
let categoryId: number;

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser() });
  userId = u.id;
  const v = await prisma.vendor.create({ data: buildVendor({ userId: u.id }) });
  vendorId = v.id;
  const cat = await prisma.productCategory.create({
    data: {
      nameJson: { ar: 'منتجات', en: 'Products' },
      slug: `expiry-cat-${Date.now()}`,
    },
  });
  categoryId = cat.id;
  const p = await prisma.product.create({
    data: buildProduct({ vendorId: v.id, categoryId: cat.id, price: 50, stock: 10 }),
  });
  productId = p.id;
}, 15000);

afterAll(async () => {
  await prisma.storeOrder.deleteMany({ where: { customerId: userId } });
  await prisma.storeCheckout.deleteMany({ where: { customerId: userId } });
  await prisma.product.deleteMany({ where: { id: productId } });
  await prisma.productCategory.deleteMany({ where: { id: categoryId } });
  await prisma.vendor.deleteMany({ where: { id: vendorId } });
  await prisma.user.deleteMany({ where: { id: userId } });
});

async function createPendingCheckout(opts: { stale: boolean }) {
  const checkout = await prisma.storeCheckout.create({
    data: {
      customerId: userId,
      idempotencyKey: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      method: 'online',
      subtotal: 100,
      total: 100,
      status: 'PENDING',
      createdAt: opts.stale
        ? new Date(Date.now() - (CHECKOUT_EXPIRY_MINUTES + 5) * 60_000)
        : new Date(),
      shipPersonName: 'Test',
      shipMobile: '0500000000',
      shipLineAddress: 'Test Street',
      shipCityName: 'RIYADH',
      shipPostalCode: '12345',
      shipCountryCode: 'SA',
    },
  });
  const order = await prisma.storeOrder.create({
    data: {
      vendorId,
      customerId: userId,
      checkoutId: checkout.id,
      totalAmount: 100,
      itemCount: 2,
      status: 'PENDING_FULFILLMENT',
    },
  });
  await prisma.storeOrderItem.create({
    data: {
      orderId: order.id,
      productId,
      nameSnapshot: { ar: 'سيروم', en: 'Serum' },
      priceSnapshot: 50,
      quantity: 2,
    },
  });
  // Simulate the placement's stock/sales effects.
  await prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: 2 }, sales: { increment: 2 } },
  });
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { totalSales: { increment: 100 } },
  });
  return { checkout, order };
}

describe('checkout expiry sweep', () => {
  it('fails stale PENDING checkouts and restores stock/sales', async () => {
    const { checkout, order } = await createPendingCheckout({ stale: true });

    const expired = await expireAbandonedCheckouts();
    expect(expired).toBeGreaterThanOrEqual(1);

    const afterOrder = await prisma.storeOrder.findUniqueOrThrow({ where: { id: order.id } });
    expect(afterOrder.status).toBe('CANCELLED');
    const afterCheckout = await prisma.storeCheckout.findUniqueOrThrow({
      where: { id: checkout.id },
    });
    expect(afterCheckout.status).toBe('FAILED');

    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(product.stock).toBe(10);
    expect(product.sales).toBe(0);
    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
    expect(Number(vendor.totalSales)).toBe(0);
  });

  it('leaves fresh PENDING checkouts alone', async () => {
    const { checkout } = await createPendingCheckout({ stale: false });

    await expireAbandonedCheckouts();

    const after = await prisma.storeCheckout.findUniqueOrThrow({ where: { id: checkout.id } });
    expect(after.status).toBe('PENDING');
  });
});
