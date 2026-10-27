/**
 * C5c — portal queries for the store-services tab: the vendor's
 * availability slots and their store bookings (ownership-guarded,
 * owner-less callers get empty shapes).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, safeFutureDate } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdServiceIds: number[] = [];
const createdBookingIds: number[] = [];

let owner: JwtPayload;
let customer: JwtPayload;
let serviceId: number;
let pseudoUserId: number;

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
    data: { userId: owner.id, storeName: 'Store c5c', storeSlug: `c5c-${Date.now()}` },
  });
  createdVendorIds.push(vendor.id);

  await prisma.address.create({
    data: { userId: customer.id, label: 'Home', city: 'Riyadh', area: 'Olaya', street: 'Main' },
  });
});

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('store-services portal queries (C5c)', () => {
  it('serviceSlots returns the pseudo-technician slots for the owner only', async () => {
    const oc = await caller(owner);
    const svc = await oc.vendorPortal.addService({
      titleAr: 'خدمة تجريبية',
      basePrice: 100,
      durationMin: 30,
    });
    serviceId = svc.id;
    createdServiceIds.push(svc.id);

    const startAt = safeFutureDate(3);
    await oc.vendorPortal.addAvailabilitySlot({
      startAt: startAt.toISOString(),
      endAt: new Date(startAt.getTime() + 3_600_000).toISOString(),
    });

    const mine = await oc.vendorPortal.serviceSlots({ days: 7 });
    expect(mine.length).toBe(1);
    expect(mine[0]!.isBooked).toBe(false);

    // Owner-less / non-vendor callers get the empty shape.
    const stranger = await caller(customer);
    expect(await stranger.vendorPortal.serviceSlots({ days: 7 })).toEqual([]);
  });

  it('storeBookings lists the store bookings with customer + service shapes', async () => {
    // Book the store service as the customer (C5b flow) so there is a
    // booking to list.
    const pseudo = await prisma.technician.findUniqueOrThrow({
      where: { storeVendorId: createdVendorIds[0] },
      include: { user: true },
    });
    pseudoUserId = pseudo.user.id;

    const startAt = safeFutureDate(4);
    const endAt = new Date(startAt.getTime() + 3_600_000);
    const address = await prisma.address.findFirstOrThrow({ where: { userId: customer.id } });
    const cc = await caller(customer);
    const booking = await cc.bookings.create({
      technicianId: pseudoUserId,
      serviceId,
      addressId: address.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      idempotencyKey: `c5c-bk-${Date.now()}`,
    });
    createdBookingIds.push(booking.id);

    const oc = await caller(owner);
    const list = await oc.vendorPortal.storeBookings({});
    expect(list.total).toBe(1);
    const row = list.items[0]!;
    expect(row.bookingCode).toBe(booking.bookingCode);
    expect(row.serviceTitleAr).toBe('خدمة تجريبية');
    expect(row.customerName).toBeDefined();
    expect(row.status).toBe('REQUESTED');

    // Status filter narrows; a stranger sees nothing.
    const filtered = await oc.vendorPortal.storeBookings({ status: 'CANCELLED' });
    expect(filtered.items.length).toBe(0);
    const stranger = await caller(customer);
    expect((await stranger.vendorPortal.storeBookings({})).total).toBe(0);
  });
});
