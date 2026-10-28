/**
 * C5g — payout attribution for store-service bookings: COMPLETED store
 * bookings join the vendor settlement math (gross = totalAmount −
 * platformFee) and the dashboard's 30-day service revenue.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, safeFutureDate } from './factories';
import { calculateVendorSettlements } from '../lib/storePayouts';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdServiceIds: number[] = [];
const createdBookingIds: number[] = [];

let owner: JwtPayload;
let customer: JwtPayload;
let serviceId: number;
let bookingId: number;
let bookingGross: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, customer].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, customer] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const vendor = await prisma.vendor.create({
    data: {
      userId: owner.id,
      storeName: 'Store c5g',
      storeSlug: `c5g-${Date.now()}`,
      commissionRate: 10,
    },
  });
  createdVendorIds.push(vendor.id);

  await prisma.address.create({
    data: { userId: customer.id, label: 'Home', city: 'Riyadh', area: 'Olaya', street: 'Main' },
  });

  // Seed a completed store booking.
  const oc = await caller(owner);
  const svc = await oc.vendorPortal.addService({
    titleAr: 'خدمة',
    basePrice: 100,
    durationMin: 30,
  });
  serviceId = svc.id;
  createdServiceIds.push(svc.id);

  const pseudo = await prisma.technician.findUniqueOrThrow({
    where: { storeVendorId: createdVendorIds[0] },
    include: { user: true },
  });
  const address = await prisma.address.findFirstOrThrow({ where: { userId: customer.id } });
  const cc = await caller(customer);
  const booking = await cc.bookings.create({
    technicianId: pseudo.user.id,
    serviceId,
    addressId: address.id,
    startAt: safeFutureDate(2).toISOString(),
    endAt: new Date(safeFutureDate(2).getTime() + 3_600_000).toISOString(),
    idempotencyKey: `c5g-bk-${Date.now()}`,
  });
  bookingId = booking.id;
  createdBookingIds.push(booking.id);
  bookingGross = Math.max(0, Number(booking.totalAmount) - Number(booking.platformFee));

  await oc.vendorPortal.updateServiceBooking({ id: booking.id, action: 'accept' });
  await oc.vendorPortal.updateServiceBooking({ id: booking.id, action: 'start' });
  await oc.vendorPortal.updateServiceBooking({ id: booking.id, action: 'complete' });
});

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('store-service payout attribution (C5g)', () => {
  it('completed store bookings join the vendor settlement (gross − platform fee)', async () => {
    const now = Date.now();
    const rows = await calculateVendorSettlements(new Date(now - 86_400_000), new Date(now + 1000));
    const mine = rows.find((r) => r.vendorId === createdVendorIds[0]);
    expect(mine).toBeDefined();
    expect(mine!.orderCount).toBe(1);
    expect(mine!.grossAmount).toBe(Math.round(bookingGross * 100) / 100);
    // fee = 10% of gross; net = gross − fee.
    expect(mine!.fee).toBe(Math.round(((mine!.grossAmount * 10) / 100) * 100) / 100);
    expect(mine!.amount).toBe(Math.round((mine!.grossAmount - mine!.fee) * 100) / 100);
  });

  it('the dashboard carries the 30-day service revenue', async () => {
    const oc = await caller(owner);
    const dash = await oc.vendorPortal.dashboard();
    const svcRevenue = (dash as { serviceRevenue30d?: number }).serviceRevenue30d ?? 0;
    expect(svcRevenue).toBeGreaterThanOrEqual(Math.round(bookingGross * 100) / 100);
  });
});
