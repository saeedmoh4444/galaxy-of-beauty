/**
 * S5 — store analytics: order-based metrics on vendorPortal.dashboard.
 * 30-day revenue, order count, average order value, distinct customers,
 * and a per-status breakdown — the "beyond top-products" gap from the
 * TOP10 plan (Phase 1 S5).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let merchant: JwtPayload;
let freshUser: JwtPayload;
let vendorId: number;
const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdOrderIds: number[] = [];

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

const DAY = 24 * 60 * 60 * 1000;

describe('store analytics (S5)', () => {
  beforeAll(async () => {
    const u1 = await prisma.user.create({ data: buildUser() });
    merchant = { id: u1.id, role: 'CUSTOMER', email: u1.email };
    const u2 = await prisma.user.create({ data: buildUser() });
    freshUser = { id: u2.id, role: 'CUSTOMER', email: u2.email };
    createdUserIds.push(u1.id, u2.id);

    const vendor = await prisma.vendor.create({
      data: {
        userId: u1.id,
        storeName: 'متجر التحليلات',
        storeSlug: `analytics-${Date.now()}`,
        isVerified: true,
        isActive: true,
      },
    });
    vendorId = vendor.id;
    createdVendorIds.push(vendor.id);

    // Customer A: one recent FULFILLED + one 45-day-old FULFILLED.
    // Customer B: one recent PENDING_FULFILLMENT.
    const custA = await prisma.user.create({ data: buildUser() });
    const custB = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(custA.id, custB.id);

    const recent = await prisma.storeOrder.create({
      data: { vendorId: vendor.id, customerId: custA.id, totalAmount: 200, status: 'FULFILLED' },
    });
    const old = await prisma.storeOrder.create({
      data: {
        vendorId: vendor.id,
        customerId: custA.id,
        totalAmount: 300,
        status: 'FULFILLED',
        createdAt: new Date(Date.now() - 45 * DAY),
      },
    });
    const pending = await prisma.storeOrder.create({
      data: {
        vendorId: vendor.id,
        customerId: custB.id,
        totalAmount: 100,
        status: 'PENDING_FULFILLMENT',
      },
    });
    createdOrderIds.push(recent.id, old.id, pending.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('returns order-based analytics on the dashboard', async () => {
    const c = callerFor(merchant);
    const dash = await c.vendorPortal.dashboard();

    expect(dash.ordersByStatus).toEqual({ FULFILLED: 2, PENDING_FULFILLMENT: 1 });
    expect(dash.revenue30d).toBe(300); // 200 recent + 100 pending; the 45-day-old order excluded
    expect(dash.ordersCount).toBe(3);
    expect(dash.aov).toBe(200); // (200 + 300 + 100) / 3
    expect(dash.customerCount).toBe(2);
  });

  it('returns zeroed analytics for a user without a vendor', async () => {
    const c = callerFor(freshUser);
    const dash = await c.vendorPortal.dashboard();

    expect(dash.ordersByStatus).toEqual({});
    expect(dash.revenue30d).toBe(0);
    expect(dash.ordersCount).toBe(0);
    expect(dash.aov).toBe(0);
    expect(dash.customerCount).toBe(0);
  });
});
