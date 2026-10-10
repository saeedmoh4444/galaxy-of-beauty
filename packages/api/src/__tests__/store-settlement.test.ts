/**
 * Store settlement (audit stage 12) — vendor payouts from FULFILLED
 * store orders, vendor payout listing, and store-order disputes with a
 * real refund path (order → REFUNDED).
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

let vendorOwner: JwtPayload;
let customer: JwtPayload;
let adminUser: JwtPayload;
let vendorId: number;
let orderIds: number[] = [];
let userIds: number[] = [];

describe('store settlement', { sequential: true }, () => {
  beforeAll(async () => {
    const owner = await prisma.user.create({ data: buildUser() });
    const cust = await prisma.user.create({ data: buildUser() });
    const adminDb = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
    vendorOwner = { id: owner.id, role: 'CUSTOMER', email: owner.email };
    customer = { id: cust.id, role: 'CUSTOMER', email: cust.email };
    adminUser = { id: adminDb.id, role: 'ADMIN', email: adminDb.email };
    userIds.push(owner.id, cust.id, adminDb.id);

    // The customer's wallet — the dispute refund must credit it (audit #3).
    await prisma.wallet.create({ data: { userId: cust.id, balance: 0 } });

    const vendor = await prisma.vendor.create({
      data: { userId: owner.id, storeName: 'متجر التسوية', storeSlug: `settle-${owner.id}` },
    });
    vendorId = vendor.id;

    const fulfilled = await prisma.storeOrder.create({
      data: { vendorId, customerId: cust.id, totalAmount: 200, status: 'FULFILLED' },
    });
    const pending = await prisma.storeOrder.create({
      data: { vendorId, customerId: cust.id, totalAmount: 100, status: 'PENDING_FULFILLMENT' },
    });
    orderIds.push(fulfilled.id, pending.id);
  }, 20000);

  afterAll(async () => {
    try {
      await prisma.dispute.deleteMany({ where: { storeOrderId: { in: orderIds } } });
    } catch {}
    try {
      await prisma.payout.deleteMany({ where: { vendorId } });
    } catch {}
    try {
      await prisma.storeOrder.deleteMany({ where: { id: { in: orderIds } } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: vendorId } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    } catch {}
  });

  it('calculateStore aggregates only FULFILLED orders into a vendor payout', async () => {
    const admin = await caller(adminUser);
    const periodStart = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const periodEnd = new Date(Date.now() + 86_400_000).toISOString();
    const result = await admin.payouts.calculateStore({ periodStart, periodEnd });

    expect(Array.isArray(result)).toBe(true);
    const mine = result.find((p: { vendorId: number }) => p.vendorId === vendorId);
    expect(mine).toBeDefined();
    expect(mine!.orderCount).toBe(1); // FULFILLED only — pending excluded
    // S3 — default 10% commission applies: 200 gross → 180 net, 20 fee.
    expect(Number(mine!.amount)).toBe(180);
    expect(Number(mine!.fee)).toBe(20);
  });

  it('S3 — calculateStore applies the vendor commissionRate', async () => {
    // Vendor.userId is @unique — one store per owner, so update the rate.
    await prisma.vendor.update({ where: { id: vendorId }, data: { commissionRate: 25 } });
    const order = await prisma.storeOrder.create({
      data: { vendorId, customerId: customer.id, totalAmount: 400, status: 'FULFILLED' },
    });
    orderIds.push(order.id);

    const admin = await caller(adminUser);
    const periodStart = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const periodEnd = new Date(Date.now() + 86_400_000).toISOString();
    const result = await admin.payouts.calculateStore({ periodStart, periodEnd });

    const mine = result.find((p: { vendorId: number }) => p.vendorId === vendorId);
    expect(mine).toBeDefined();
    // 25% commission on 600 gross (200 + 400) → 450 net, 150 fee.
    expect(Number(mine!.amount)).toBe(450);
    expect(Number(mine!.fee)).toBe(150);
  });

  it('S3 — admin can update a vendor commissionRate', async () => {
    const admin = await caller(adminUser);
    const updated = await admin.payouts.setVendorCommission({ vendorId, commissionRate: 15 });
    expect(Number(updated.commissionRate)).toBe(15);
  });

  it('listStorePayouts returns the vendor payouts for the owner', async () => {
    const admin = await caller(adminUser);
    const periodStart = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const periodEnd = new Date(Date.now() + 86_400_000).toISOString();
    await admin.payouts.calculateStore({ periodStart, periodEnd });

    const ownerCaller = await caller(vendorOwner);
    const payouts = await ownerCaller.payouts.listStorePayouts({});
    expect(payouts.items.length).toBeGreaterThanOrEqual(1);
    expect(payouts.items.every((p: { vendorId: number }) => p.vendorId === vendorId)).toBe(true);
  });

  it('a store-order dispute refunds the order on admin resolution', async () => {
    const cust = await caller(customer);
    const created = await cust.disputes.create({
      storeOrderId: orderIds[0],
      reason: 'منتج تالف',
      description: 'وصل المنتج تالفاً',
    });
    expect(created.storeOrderId).toBe(orderIds[0]);

    const admin = await caller(adminUser);
    const resolved = await admin.disputes.resolve({
      disputeId: created.id,
      resolution: 'استرداد كامل',
      status: 'RESOLVED_CUSTOMER',
    });
    expect(resolved.status).toBe('RESOLVED_CUSTOMER');

    const order = await prisma.storeOrder.findUniqueOrThrow({ where: { id: orderIds[0] } });
    expect(order.status).toBe('REFUNDED');

    // Audit #3 — the refund must actually move money: wallet credited + a
    // CREDIT REFUND transaction recorded.
    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });
    expect(Number(wallet.balance)).toBe(200); // the order total, returned

    const txn = await prisma.walletTransaction.findFirst({
      where: {
        walletId: wallet.id,
        type: 'CREDIT',
        source: 'REFUND',
        referenceId: String(orderIds[0]),
      },
    });
    expect(txn).toBeTruthy();
    expect(Number(txn!.amount)).toBe(200);
  });

  it('rejects a dispute with neither bookingId nor storeOrderId', async () => {
    const cust = await caller(customer);
    await expect(cust.disputes.create({ reason: 'x' })).rejects.toThrow();
  });
});
