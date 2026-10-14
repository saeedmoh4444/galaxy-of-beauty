/**
 * C3 — Deals studio (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
 * Lifecycle derivation (pending / upcoming / active / ended / rejected),
 * end-deal-early, edit-while-pending, and per-deal sales during the window.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma, Prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdSubmissionIds: number[] = [];
const createdDealIds: number[] = [];
const createdOrderIds: number[] = [];
const createdItemIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let admin: JwtPayload;
let vendorId: number;
let productId: number;

const NOW = Date.now();
const HOUR = 3_600_000;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

/** Propose a deal and track the submission id. */
async function propose(c: ReturnType<typeof caller>, overrides: Record<string, unknown> = {}) {
  const sub = await c.vendorPortal.proposeDeal({
    productId,
    dealPrice: 50,
    startsAt: new Date(NOW - HOUR).toISOString(),
    endsAt: new Date(NOW + 7 * 24 * HOUR).toISOString(),
    ...overrides,
  });
  createdSubmissionIds.push(sub.id);
  return sub;
}

/** Approve a submission and return the materialized StoreDeal. */
async function approve(subId: number) {
  const a = await caller(admin);
  await a.providerReview.decide({ id: subId, approve: true });
  const deal = await prisma.storeDeal.findFirst({ where: { vendorId } });
  if (deal) createdDealIds.push(deal.id);
  return deal;
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const outsiderU = await prisma.user.create({ data: buildUser() });
  const adminU = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  createdUserIds.push(ownerU.id, outsiderU.id, adminU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  outsider = { id: outsiderU.id, role: 'CUSTOMER', email: outsiderU.email };
  admin = { id: adminU.id, role: 'ADMIN', email: adminU.email };

  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Deals Store', storeSlug: `dl-${Date.now()}` },
  });
  vendorId = vendor.id;
  await prisma.vendor.create({
    data: { userId: outsiderU.id, storeName: 'Outsider Store', storeSlug: `dl2-${Date.now()}` },
  });
  const cat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'أساسي', en: 'Core' }, slug: `dl-cat-${Date.now()}` },
  });
  const p = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: cat.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      descriptionJson: { ar: '', en: '' },
      price: 100,
      stock: 50,
    },
  });
  productId = p.id;
}, 15000);

afterAll(async () => {
  await prisma.storeOrderItem.deleteMany({ where: { id: { in: createdItemIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.storeDeal.deleteMany({ where: { id: { in: createdDealIds } } });
  await prisma.providerSubmission.deleteMany({ where: { id: { in: createdSubmissionIds } } });
  await prisma.product.deleteMany({ where: { vendor: { userId: { in: createdUserIds } } } });
  await prisma.productCategory.deleteMany({ where: { slug: { startsWith: 'dl-cat' } } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('C3 — deal lifecycle derivation (myDeals)', () => {
  it('derives pending → active after approval', async () => {
    const c = await caller(owner);
    const sub = await propose(c);

    let rows = await c.vendorPortal.myDeals();
    let mine = rows.find((r) => r.id === sub.id);
    expect(mine?.lifecycle).toBe('pending');

    await approve(sub.id);
    rows = await c.vendorPortal.myDeals();
    mine = rows.find((r) => r.id === sub.id);
    expect(mine?.lifecycle).toBe('active');
    expect(mine?.dealId).toBeDefined();
  });

  it('derives upcoming for a future window and ended for a past one', async () => {
    const c = await caller(owner);

    const future = await propose(c, {
      startsAt: new Date(NOW + 2 * 24 * HOUR).toISOString(),
      endsAt: new Date(NOW + 9 * 24 * HOUR).toISOString(),
    });
    await approve(future.id);
    let rows = await c.vendorPortal.myDeals();
    expect(rows.find((r) => r.id === future.id)?.lifecycle).toBe('upcoming');

    const past = await propose(c, {
      startsAt: new Date(NOW - 5 * 24 * HOUR).toISOString(),
      endsAt: new Date(NOW - HOUR).toISOString(),
    });
    await approve(past.id);
    rows = await c.vendorPortal.myDeals();
    expect(rows.find((r) => r.id === past.id)?.lifecycle).toBe('ended');
  });

  it('derives rejected for a declined submission', async () => {
    const c = await caller(owner);
    const sub = await propose(c);
    const a = await caller(admin);
    await a.providerReview.decide({ id: sub.id, approve: false });
    const rows = await c.vendorPortal.myDeals();
    expect(rows.find((r) => r.id === sub.id)?.lifecycle).toBe('rejected');
  });
});

describe('C3 — end-deal-early', () => {
  it('the owner ends an active deal early; the lifecycle flips to ended', async () => {
    const c = await caller(owner);
    const sub = await propose(c, {
      endsAt: new Date(NOW + 30 * 24 * HOUR).toISOString(),
    });
    const deal = await approve(sub.id);
    expect(deal).not.toBeNull();

    const rows = await c.vendorPortal.myDeals();
    const mine = rows.find((r) => r.id === sub.id);
    expect(mine?.lifecycle).toBe('active');

    await c.vendorPortal.endDeal({ dealId: deal!.id });
    const after = await c.vendorPortal.myDeals();
    expect(after.find((r) => r.id === sub.id)?.lifecycle).toBe('ended');
  });

  it('a non-owner cannot end the deal', async () => {
    const c = await caller(owner);
    const sub = await propose(c);
    const deal = await approve(sub.id);

    const other = await caller(outsider);
    await expect(other.vendorPortal.endDeal({ dealId: deal!.id })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

describe('C3 — edit-while-pending', () => {
  it('updates the pending proposal window and price', async () => {
    const c = await caller(owner);
    const sub = await propose(c);

    const updated = await c.vendorPortal.editPendingDeal({
      submissionId: sub.id,
      dealPrice: 45,
      endsAt: new Date(NOW + 10 * 24 * HOUR).toISOString(),
    });
    const payload = updated.payload as { dealPrice: number; endsAt: string };
    expect(payload.dealPrice).toBe(45);
    expect(new Date(payload.endsAt).getTime()).toBeGreaterThan(NOW + 9 * 24 * HOUR);
  });

  it('rejects editing after the admin decision', async () => {
    const c = await caller(owner);
    const sub = await propose(c);
    await approve(sub.id);
    await expect(
      c.vendorPortal.editPendingDeal({ submissionId: sub.id, dealPrice: 40 }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

describe('C3 — per-deal sales during the window', () => {
  it('counts order items for the product inside the deal window only', async () => {
    const c = await caller(owner);
    const sub = await propose(c);
    const deal = await approve(sub.id);
    expect(deal).not.toBeNull();

    const buyer = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(buyer.id);
    const order = await prisma.storeOrder.create({
      data: { vendorId, customerId: buyer.id, totalAmount: 150, itemCount: 3, status: 'FULFILLED' },
    });
    createdOrderIds.push(order.id);
    const item = await prisma.storeOrderItem.create({
      data: {
        orderId: order.id,
        productId,
        nameSnapshot: { ar: 'سيروم' },
        priceSnapshot: new Prisma.Decimal(50),
        quantity: 3,
      },
    });
    createdItemIds.push(item.id);

    const rows = await c.vendorPortal.myDeals();
    expect(rows.find((r) => r.id === sub.id)?.salesInWindow).toBe(3);
  });
});
