/**
 * B5 — vendor-side disputes (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
 * The vendor sees disputes on their orders, responds (OPEN → UNDER_REVIEW,
 * response recorded), and the admin resolves as today. Post-fulfillment
 * Fatoorah refunds stay gated on FATOORAH_API_TOKEN — wallet refunds work.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma, Prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, paidCheckoutForOrder } from './factories';

const createdUserIds: number[] = [];

let vendorOwner: JwtPayload;
let otherVendorOwner: JwtPayload;
let customer: JwtPayload;
let admin: JwtPayload;
let orderId: number;
let disputeId: number;
let vendorId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const otherU = await prisma.user.create({ data: buildUser() });
  const custU = await prisma.user.create({ data: buildUser() });
  const adminU = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  createdUserIds.push(ownerU.id, otherU.id, custU.id, adminU.id);
  vendorOwner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  otherVendorOwner = { id: otherU.id, role: 'CUSTOMER', email: otherU.email };
  customer = { id: custU.id, role: 'CUSTOMER', email: custU.email };
  admin = { id: adminU.id, role: 'ADMIN', email: adminU.email };

  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Dispute Store', storeSlug: `disp-${Date.now()}` },
  });
  vendorId = vendor.id;
  await prisma.vendor.create({
    data: { userId: otherU.id, storeName: 'Other Store', storeSlug: `disp2-${Date.now()}` },
  });
  await prisma.wallet.create({ data: { userId: custU.id, balance: 0 } });

  const order = await prisma.storeOrder.create({
    data: {
      vendorId: vendor.id,
      customerId: custU.id,
      totalAmount: 150,
      itemCount: 1,
      status: 'FULFILLED',
    },
  });
  orderId = order.id;
  // M2/M4 — resolve refunds only a PAID wallet checkout; the fixture
  // order must carry one for the refund to move money.
  await paidCheckoutForOrder(orderId);
}, 15000);

afterAll(async () => {
  await prisma.walletTransaction.deleteMany({
    where: { wallet: { userId: { in: createdUserIds } } },
  });
  await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
  // Disputes cascade with their store order.
  await prisma.storeOrder.deleteMany({ where: { id: orderId } });
  // Checkouts reference customers (onDelete Restrict) — clear before users.
  await prisma.storeCheckout.deleteMany({ where: { customerId: { in: createdUserIds } } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('B5 — vendor dispute surface', () => {
  it('customer raises a store-order dispute; the vendor sees it in orders', async () => {
    const c = await caller(customer);
    const dispute = await c.disputes.create({
      storeOrderId: orderId,
      reason: 'Item damaged on arrival',
      description: 'The serum bottle was cracked.',
    });
    disputeId = dispute.id;
    expect(dispute.status).toBe('OPEN');

    const v = await caller(vendorOwner);
    const orders = await v.vendorPortal.orders({ limit: 20 });
    const order = orders.items.find((o) => o.id === orderId);
    expect(order).toBeDefined();
    expect(order.dispute).not.toBeNull();
    expect(order.dispute).toMatchObject({
      id: disputeId,
      reason: 'Item damaged on arrival',
      status: 'OPEN',
      vendorResponse: null,
    });
  });

  it('a non-owner vendor cannot respond', async () => {
    const other = await caller(otherVendorOwner);
    await expect(
      other.disputes.respond({ disputeId, response: 'Not my order' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('the owning vendor responds: OPEN → UNDER_REVIEW with the response recorded', async () => {
    const v = await caller(vendorOwner);
    const updated = await v.disputes.respond({
      disputeId,
      response: 'We will ship a replacement bottle today.',
    });
    expect(updated.status).toBe('UNDER_REVIEW');
    expect(updated.vendorResponse).toBe('We will ship a replacement bottle today.');
    expect(updated.vendorRespondedAt).not.toBeNull();

    const row = await prisma.dispute.findUnique({ where: { id: disputeId } });
    expect(row?.status).toBe('UNDER_REVIEW');
  });

  it('the vendor can update their response while still under review', async () => {
    const v = await caller(vendorOwner);
    const updated = await v.disputes.respond({
      disputeId,
      response: 'Replacement shipped with tracking #GOB-123.',
    });
    expect(updated.vendorResponse).toBe('Replacement shipped with tracking #GOB-123.');
  });

  it('getById now lets the owning vendor view a customer-raised store dispute', async () => {
    const v = await caller(vendorOwner);
    const dispute = await v.disputes.getById({ disputeId });
    expect(dispute.id).toBe(disputeId);
    expect(dispute.reason).toBe('Item damaged on arrival');
  });

  it('admin resolves for the customer after the vendor response (wallet refund)', async () => {
    const a = await caller(admin);
    const resolved = await a.disputes.resolve({
      disputeId,
      resolution: 'Customer is right — full refund.',
      status: 'RESOLVED_CUSTOMER',
    });
    expect(resolved.status).toBe('RESOLVED_CUSTOMER');
    expect(resolved.vendorResponse).toBe('Replacement shipped with tracking #GOB-123.');

    const wallet = await prisma.wallet.findUnique({ where: { userId: customer.id } });
    expect(Number(wallet?.balance)).toBe(150);
  });

  it('respond rejects after resolution', async () => {
    const v = await caller(vendorOwner);
    await expect(v.disputes.respond({ disputeId, response: 'Too late' })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });
});
