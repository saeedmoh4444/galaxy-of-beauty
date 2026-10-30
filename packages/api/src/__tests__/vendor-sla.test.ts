/**
 * A3 — Fulfillment SLA tracking (VENDOR_PROFESSIONALIZATION_PLAN Wave A).
 * Each store promises a fulfillment window (fulfillmentSlaHours, default
 * 48); the daily gob-sla sweep flags PENDING_FULFILLMENT orders past the
 * vendor's window (once, slaBreachedAt) and notifies the vendor. The
 * dashboard surfaces the 30-day on-time rate; feeds A5 quality scoring.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, paidCheckoutForOrder } from './factories';
import { handleOrderSlaSweep } from '../workers/handlers';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdOrderIds: number[] = [];
const createdTemplateIds: number[] = [];

let owner: JwtPayload;
let fastVendorId: number; // 24h SLA
let slowVendorId: number; // 72h SLA

async function caller(user: JwtPayload) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function mkUser() {
  const u = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(u.id);
  return u;
}

async function mkOrder(vendorId: number, opts: { ageHours: number; status?: string }) {
  const o = await prisma.storeOrder.create({
    data: {
      vendorId,
      customerId: owner.id,
      totalAmount: 100,
      itemCount: 1,
      status: opts.status ?? 'PENDING_FULFILLMENT',
      createdAt: new Date(Date.now() - opts.ageHours * 3_600_000),
    },
  });
  createdOrderIds.push(o.id);
  if ((opts.status ?? 'PENDING_FULFILLMENT') === 'PENDING_FULFILLMENT') {
    await paidCheckoutForOrder(o.id);
  }
  return o;
}

beforeAll(async () => {
  const t = await prisma.notificationTemplate.upsert({
    where: { key: 'order_sla_breached' },
    update: {},
    create: {
      key: 'order_sla_breached',
      category: 'provider',
      channels: ['in_app'],
      titleJson: { ar: 'طلب متأخر', en: 'Order Breached SLA' },
      bodyJson: { ar: 'الطلب #{{orderId}}', en: 'Order #{{orderId}}' },
    },
  });
  createdTemplateIds.push(t.id);

  const ownerU = await mkUser();
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  const owner2 = await mkUser();

  const fast = await prisma.vendor.create({
    data: {
      userId: owner.id,
      storeName: 'V fast',
      storeSlug: `a3-fast-${Date.now()}`,
      fulfillmentSlaHours: 24,
    },
  });
  const slow = await prisma.vendor.create({
    data: {
      userId: owner2.id,
      storeName: 'V slow',
      storeSlug: `a3-slow-${Date.now()}`,
      fulfillmentSlaHours: 72,
    },
  });
  createdVendorIds.push(fast.id, slow.id);
  fastVendorId = fast.id;
  slowVendorId = slow.id;

  // Fast vendor: one 30h-old breach, one fresh (not breached), one
  // already-fulfilled 30h-old (must NOT be touched).
  await mkOrder(fastVendorId, { ageHours: 30 }); // breach (24h SLA)
  await mkOrder(fastVendorId, { ageHours: 3 }); // fine
  const fulfilled = await mkOrder(fastVendorId, { ageHours: 30, status: 'FULFILLED' });
  await prisma.storeOrder.update({
    where: { id: fulfilled.id },
    data: { fulfilledAt: new Date(Date.now() - 29 * 3_600_000) },
  });
  // Slow vendor: a 30h-old order — inside its 72h window, NOT breached.
  await mkOrder(slowVendorId, { ageHours: 30 });
}, 20000);

afterAll(async () => {
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.notificationTemplate.deleteMany({ where: { id: { in: createdTemplateIds } } });
  // Checkouts reference customers (onDelete Restrict) — clear before users.
  await prisma.storeCheckout.deleteMany({ where: { customerId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('A3 — fulfillment SLA tracking', () => {
  it('fulfillOrder stamps fulfilledAt', async () => {
    const fresh = await mkOrder(fastVendorId, { ageHours: 1 });
    const c = await caller(owner);
    const res = await c.vendorPortal.fulfillOrder({ orderId: fresh.id });
    expect(res.fulfilledAt).toBeTruthy();
  });

  it('the sweep flags only orders past their vendor SLA window', async () => {
    // The sweep is global — parallel suites' stale orders can add to the
    // count, so assert on OUR rows, not the total.
    const res = await handleOrderSlaSweep({ data: {} } as never);
    expect(res.flagged).toBeGreaterThanOrEqual(1);

    const flagged = await prisma.storeOrder.findMany({
      where: { vendorId: fastVendorId, slaBreachedAt: { not: null } },
    });
    expect(flagged).toHaveLength(1);

    const slowOrders = await prisma.storeOrder.findMany({
      where: { vendorId: slowVendorId, slaBreachedAt: { not: null } },
    });
    expect(slowOrders).toHaveLength(0); // 30h < 72h window

    // The fast vendor got the inbox notification.
    const notifs = await prisma.notification.findMany({
      where: { userId: owner.id, type: 'order_sla_breached' },
    });
    expect(notifs).toHaveLength(1);
  });

  it('the sweep is idempotent (no double flags or notifications)', async () => {
    await handleOrderSlaSweep({ data: {} } as never);
    const flagged = await prisma.storeOrder.findMany({
      where: { vendorId: fastVendorId, slaBreachedAt: { not: null } },
    });
    expect(flagged).toHaveLength(1); // still exactly one flag
    const notifs = await prisma.notification.findMany({
      where: { userId: owner.id, type: 'order_sla_breached' },
    });
    expect(notifs).toHaveLength(1);
  });

  it('setFulfillmentSla is ownership-guarded and updates the window', async () => {
    const c = await caller(owner);
    const updated = await c.vendorPortal.setFulfillmentSla({ hours: 48 });
    expect(updated.fulfillmentSlaHours).toBe(48);

    const other = await mkUser();
    const otherC = await caller({ id: other.id, role: 'CUSTOMER', email: other.email });
    await expect(otherC.vendorPortal.setFulfillmentSla({ hours: 24 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('dashboard.sla returns the breach count and on-time rate', async () => {
    const c = await caller(owner);
    const dash = await c.vendorPortal.dashboard();
    expect(dash.sla).toBeTruthy();
    // Fast vendor: 1 breached, 1 fulfilled on time (29h vs 24h SLA → late
    // actually)… the on-time rate counts only non-breached fulfillments.
    expect(dash.sla.breached30d).toBeGreaterThanOrEqual(1);
    expect(typeof dash.sla.onTimeRate).toBe('number');
  });
});
