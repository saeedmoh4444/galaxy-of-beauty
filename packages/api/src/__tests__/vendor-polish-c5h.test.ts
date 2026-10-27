/**
 * C5h — polish guards: availability limits (no overlapping slots, a cap
 * on upcoming unbooked slots) and the vendor cancellation window.
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
const createdSlotIds: number[] = [];

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
    data: { userId: owner.id, storeName: 'Store c5h', storeSlug: `c5h-${Date.now()}` },
  });
  createdVendorIds.push(vendor.id);

  await prisma.address.create({
    data: { userId: customer.id, label: 'Home', city: 'Riyadh', area: 'Olaya', street: 'Main' },
  });

  const oc = await caller(owner);
  const svc = await oc.vendorPortal.addService({
    titleAr: 'خدمة',
    basePrice: 50,
    durationMin: 30,
  });
  serviceId = svc.id;
  createdServiceIds.push(svc.id);

  const pseudo = await prisma.technician.findUniqueOrThrow({
    where: { storeVendorId: createdVendorIds[0] },
    include: { user: true },
  });
  pseudoUserId = pseudo.user.id;
});

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.availabilitySlot.deleteMany({ where: { id: { in: createdSlotIds } } });
  await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('polish guards (C5h)', () => {
  it('rejects overlapping slots', async () => {
    const oc = await caller(owner);
    const startAt = safeFutureDate(5);
    const endAt = new Date(startAt.getTime() + 3_600_000);
    const slot = await oc.vendorPortal.addAvailabilitySlot({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    });
    createdSlotIds.push(slot.id);

    // A window nested inside the existing one overlaps.
    await expect(
      oc.vendorPortal.addAvailabilitySlot({
        startAt: new Date(startAt.getTime() + 600_000).toISOString(),
        endAt: new Date(startAt.getTime() + 1_800_000).toISOString(),
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('caps upcoming unbooked slots at 30', async () => {
    // Fill the calendar directly (targeted inserts) then hit the API cap.
    const pseudo = await prisma.technician.findUniqueOrThrow({
      where: { storeVendorId: createdVendorIds[0] },
    });
    const base = safeFutureDate(6).getTime();
    const rows = await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        prisma.availabilitySlot.create({
          data: {
            technicianId: pseudo.id,
            startAt: new Date(base + i * 7_200_000),
            endAt: new Date(base + i * 7_200_000 + 3_600_000),
          },
        }),
      ),
    );
    createdSlotIds.push(...rows.map((r) => r.id));

    const oc = await caller(owner);
    await expect(
      oc.vendorPortal.addAvailabilitySlot({
        startAt: safeFutureDate(7).toISOString(),
        endAt: new Date(safeFutureDate(7).getTime() + 3_600_000).toISOString(),
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('cannot cancel a booking starting within 4 hours', async () => {
    const oc = await caller(owner);
    const address = await prisma.address.findFirstOrThrow({ where: { userId: customer.id } });
    const cc = await caller(customer);
    const booking = await cc.bookings.create({
      technicianId: pseudoUserId,
      serviceId,
      addressId: address.id,
      startAt: safeFutureDate(3).toISOString(),
      endAt: new Date(safeFutureDate(3).getTime() + 3_600_000).toISOString(),
      idempotencyKey: `c5h-soon-${Date.now()}`,
    });
    createdBookingIds.push(booking.id);

    // Move the booking to start in 2 hours (direct update — the window
    // guard reads startAt; Jummah validation only runs on create).
    const soon = new Date(Date.now() + 2 * 3_600_000);
    await prisma.booking.update({
      where: { id: booking.id },
      data: { startAt: soon, endAt: new Date(soon.getTime() + 3_600_000) },
    });

    await expect(
      oc.vendorPortal.updateServiceBooking({ id: booking.id, action: 'cancel' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
