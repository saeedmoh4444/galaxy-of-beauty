/**
 * C5f — vendor booking status management: the store owner runs the SAME
 * state machine as the engine on their own bookings (accept/start/
 * complete/cancel/reject), ownership-guarded and slot-aware.
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
let otherOwner: JwtPayload;
let serviceId: number;
let pseudoUserId: number;
let bookingId: number;
let slotId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, customer, otherOwner].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, customer, otherOwner] = users.map((u) => ({
    id: u.id,
    role: 'CUSTOMER',
    email: u.email,
  }));

  const slugA = `c5f-${Date.now()}`;
  const [vA, vB] = await Promise.all([
    prisma.vendor.create({
      data: { userId: owner.id, storeName: 'Store A c5f', storeSlug: slugA },
    }),
    prisma.vendor.create({
      data: { userId: otherOwner.id, storeName: 'Store B c5f', storeSlug: `c5f-b-${Date.now()}` },
    }),
  ]);
  createdVendorIds.push(vA.id, vB.id);

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

describe('vendor booking status actions (C5f)', () => {
  beforeAll(async () => {
    // Seed one store booking: service + slot + customer booking.
    const oc = await caller(owner);
    const svc = await oc.vendorPortal.addService({
      titleAr: 'قص شعر',
      basePrice: 70,
      durationMin: 30,
    });
    serviceId = svc.id;
    createdServiceIds.push(svc.id);

    const startAt = safeFutureDate(3);
    const endAt = new Date(startAt.getTime() + 3_600_000);
    const slot = await oc.vendorPortal.addAvailabilitySlot({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    });
    slotId = slot.id;

    const pseudo = await prisma.technician.findUniqueOrThrow({
      where: { storeVendorId: createdVendorIds[0] },
      include: { user: true },
    });
    pseudoUserId = pseudo.user.id;

    const address = await prisma.address.findFirstOrThrow({ where: { userId: customer.id } });
    const cc = await caller(customer);
    const booking = await cc.bookings.create({
      technicianId: pseudoUserId,
      serviceId,
      addressId: address.id,
      slotId: slot.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      idempotencyKey: `c5f-bk-${Date.now()}`,
    });
    bookingId = booking.id;
    createdBookingIds.push(booking.id);
  });

  it('the owner runs the state machine: accept then start then complete', async () => {
    const oc = await caller(owner);

    const accepted = await oc.vendorPortal.updateServiceBooking({
      id: bookingId,
      action: 'accept',
    });
    expect(accepted.status).toBe('ACCEPTED');

    const started = await oc.vendorPortal.updateServiceBooking({ id: bookingId, action: 'start' });
    expect(started.status).toBe('IN_PROGRESS');

    const completed = await oc.vendorPortal.updateServiceBooking({
      id: bookingId,
      action: 'complete',
    });
    expect(completed.status).toBe('COMPLETED');

    // Completion stats ride the store's hidden technician (parity).
    const pseudo = await prisma.technician.findUniqueOrThrow({
      where: { storeVendorId: createdVendorIds[0] },
    });
    expect(pseudo.completedBookings).toBeGreaterThanOrEqual(1);
  });

  it('rejects an invalid transition and cross-vendor access', async () => {
    const oc = await caller(owner);
    // COMPLETED is terminal for the engine's map — nothing transitions out.
    await expect(
      oc.vendorPortal.updateServiceBooking({ id: bookingId, action: 'complete' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    // Another vendor cannot see or act on this booking.
    const stranger = await caller(otherOwner);
    await expect(
      stranger.vendorPortal.updateServiceBooking({ id: bookingId, action: 'cancel' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('cancelling a fresh booking frees its slot', async () => {
    // A second booking on a second slot, cancelled by the owner.
    const oc = await caller(owner);
    // Day 9 (not the beforeAll's Jummah-shifted day-3 window).
    const startAt = safeFutureDate(9);
    const slot = await oc.vendorPortal.addAvailabilitySlot({
      startAt: startAt.toISOString(),
      endAt: new Date(startAt.getTime() + 3_600_000).toISOString(),
    });
    const address = await prisma.address.findFirstOrThrow({ where: { userId: customer.id } });
    const cc = await caller(customer);
    const booking = await cc.bookings.create({
      technicianId: pseudoUserId,
      serviceId,
      addressId: address.id,
      slotId: slot.id,
      startAt: startAt.toISOString(),
      endAt: new Date(startAt.getTime() + 3_600_000).toISOString(),
      idempotencyKey: `c5f-cxl-${Date.now()}`,
    });
    createdBookingIds.push(booking.id);

    const cancelled = await oc.vendorPortal.updateServiceBooking({
      id: booking.id,
      action: 'cancel',
      reason: 'vendor unavailable',
    });
    expect(cancelled.status).toBe('CANCELLED');

    const slotAfter = await prisma.availabilitySlot.findUniqueOrThrow({ where: { id: slot.id } });
    expect(slotAfter.isBooked).toBe(false);
    expect(slotAfter.bookingId).toBeNull();
  });
});
