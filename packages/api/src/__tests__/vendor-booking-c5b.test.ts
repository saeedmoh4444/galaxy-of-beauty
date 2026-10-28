/**
 * C5b — booking-flow integration for store services (engine-reuse proof):
 * a vendor publishes a store service + availability slots, a customer
 * books it through the untouched booking engine, and the booking carries
 * the denormalized vendor link. Isolation: a store service can never be
 * booked with an unrelated technician.
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
let realTech: JwtPayload;
let realTechTechnicianId: number;
let serviceId: number;
let pseudoUserId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, customer, realTech].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, customer, realTech] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const vendor = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'Store c5b', storeSlug: `c5b-${Date.now()}` },
  });
  createdVendorIds.push(vendor.id);

  // A real technician (VERIFIED, city RIYADH) for the isolation test.
  const techRow = await prisma.technician.create({
    data: { userId: realTech.id, city: 'RIYADH', bioJson: { ar: '', en: '' } },
  });
  realTechTechnicianId = techRow.id;

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

describe('store-service booking flow (C5b)', () => {
  it('vendor publishes a service + slot; customer books it end-to-end', async () => {
    const oc = await caller(owner);
    const svc = await oc.vendorPortal.addService({
      titleAr: 'قص شعر رجالي',
      titleEn: 'Men haircut',
      basePrice: 80,
      durationMin: 30,
    });
    serviceId = svc.id;
    createdServiceIds.push(svc.id);

    // The vendor publishes an availability slot for the store.
    const startAt = safeFutureDate(3);
    const endAt = new Date(startAt.getTime() + 3_600_000);
    const slot = await oc.vendorPortal.addAvailabilitySlot({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    });
    expect(slot.id).toBeGreaterThan(0);

    // Resolve the pseudo-technician's hidden user id (the public
    // storefront resolves this via the store page in C5d).
    const pseudo = await prisma.technician.findUniqueOrThrow({
      where: { storeVendorId: createdVendorIds[0] },
      include: { user: true },
    });
    pseudoUserId = pseudo.user.id;

    const address = await prisma.address.findFirstOrThrow({
      where: { userId: customer.id },
    });
    const cc = await caller(customer);
    const booking = await cc.bookings.create({
      technicianId: pseudoUserId,
      serviceId,
      addressId: address.id,
      slotId: slot.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      idempotencyKey: `c5b-bk-${Date.now()}`,
    });
    createdBookingIds.push(booking.id);

    // Engine-reuse proof: the booking exists with the store link stamped.
    expect(booking.status).toBe('REQUESTED');
    expect(booking.vendorId).toBe(createdVendorIds[0]);

    // The slot is marked booked and linked to the booking.
    const slotAfter = await prisma.availabilitySlot.findUniqueOrThrow({ where: { id: slot.id } });
    expect(slotAfter.isBooked).toBe(true);
    expect(slotAfter.bookingId).toBe(booking.id);
  });

  it('rejects booking a store service with an unrelated technician', async () => {
    const address = await prisma.address.findFirstOrThrow({ where: { userId: customer.id } });
    const cc = await caller(customer);
    await expect(
      cc.bookings.create({
        technicianId: realTech.id, // a real technician, not the store's pseudo row
        serviceId,
        addressId: address.id,
        startAt: safeFutureDate(4).toISOString(),
        endAt: new Date(safeFutureDate(4).getTime() + 3_600_000).toISOString(),
        idempotencyKey: `c5b-iso-${Date.now()}`,
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('addAvailabilitySlot validates the window and guards ownership', async () => {
    const oc = await caller(owner);
    const t = safeFutureDate(5);
    await expect(
      oc.vendorPortal.addAvailabilitySlot({
        startAt: new Date(t.getTime() + 3_600_000).toISOString(),
        endAt: t.toISOString(),
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    // A stranger cannot publish slots for this store (no vendor → NOT_FOUND).
    const stranger = await caller(customer);
    await expect(
      stranger.vendorPortal.addAvailabilitySlot({
        startAt: safeFutureDate(6).toISOString(),
        endAt: new Date(safeFutureDate(6).getTime() + 3_600_000).toISOString(),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
