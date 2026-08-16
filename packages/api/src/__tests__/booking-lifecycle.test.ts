/**
 * Booking lifecycle integration tests — create, the transition state
 * machine, role authorization, slot lifecycle, and timeline.
 * Coverage ratchet target: src/routers/bookings.ts (was 23.94%).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let technician: JwtPayload;
let otherCustomer: JwtPayload;
let serviceId: number;
let addressId: number;
let technicianUserId: number;
let technicianRecordId: number;

let uid = 0;
const newIdemKey = () => `mob_lifecycle_${Date.now()}_${uid++}`;

async function seedSlot(): Promise<number> {
  const slot = await prisma.availabilitySlot.create({
    data: {
      technicianId: technicianRecordId,
      startAt: new Date(Date.now() + 86400000),
      endAt: new Date(Date.now() + 86400000 + 3600000),
      isBooked: false,
    },
  });
  return slot.id;
}

async function createBooking(opts?: { idempotencyKey?: string; slotId?: number }) {
  const caller = await authCaller(customer);
  return caller.bookings.create({
    serviceId,
    technicianId: technicianUserId,
    addressId,
    slotId: opts?.slotId ?? (await seedSlot()),
    startAt: new Date(Date.now() + 86400000).toISOString(),
    endAt: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    idempotencyKey: opts?.idempotencyKey ?? newIdemKey(),
  });
}

beforeAll(async () => {
  const anon = await anonCaller();
  const login = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  customer = { id: login.user.id, role: login.user.role, email: login.user.email };

  const tech = await prisma.technician.findFirst({
    include: { user: true },
    where: { user: { role: 'TECHNICIAN' } },
  });
  if (!tech) throw new Error('No technician in seed data');
  technician = { id: tech.userId, role: 'TECHNICIAN', email: tech.user.email };
  technicianUserId = tech.userId;
  technicianRecordId = tech.id;

  const other = await prisma.user.findFirst({
    where: { role: 'CUSTOMER', id: { not: customer.id } },
  });
  if (!other) throw new Error('No second customer in seed data');
  otherCustomer = { id: other.id, role: other.role, email: other.email };

  const service = await prisma.service.findFirst();
  if (!service) throw new Error('No service in seed data');
  serviceId = service.id;

  const address = await prisma.address.findFirst({ where: { userId: customer.id } });
  addressId =
    address?.id ??
    (
      await prisma.address.create({
        data: {
          userId: customer.id,
          label: 'اختبار الحجز',
          city: 'الرياض',
          area: 'التجريبي',
          street: 'شارع الاختبار',
        },
      })
    ).id;
}, 15000);

describe('Booking lifecycle', () => {
  it('should create a REQUESTED booking and book the slot', async () => {
    const slotId = await seedSlot();
    const booking = await createBooking({ slotId });
    expect(booking.status).toBe('REQUESTED');
    expect(booking.bookingCode).toMatch(/^GOB-/);
    expect(Number(booking.totalAmount)).toBeGreaterThan(0);

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
    expect(slot?.isBooked).toBe(true);
    expect(slot?.bookingId).toBe(booking.id);
  });

  it('should return the existing booking for a duplicate idempotency key', async () => {
    const key = newIdemKey();
    const first = await createBooking({ idempotencyKey: key });
    const second = await createBooking({ idempotencyKey: key });
    expect(second.id).toBe(first.id);
  });

  it('should reject creating a booking on an already-booked slot', async () => {
    const slotId = await seedSlot();
    await createBooking({ slotId });
    await expect(createBooking({ slotId })).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('should let the involved technician accept the booking', async () => {
    const booking = await createBooking();
    const techCaller = await authCaller(technician);
    const updated = await techCaller.bookings.transition({ id: booking.id, action: 'accept' });
    expect(updated.status).toBe('ACCEPTED');
  });

  it('should forbid a stranger customer from acting on the booking', async () => {
    const booking = await createBooking();
    const stranger = await authCaller(otherCustomer);
    await expect(
      stranger.bookings.transition({ id: booking.id, action: 'cancel' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('should reject an invalid state transition', async () => {
    const booking = await createBooking();
    const techCaller = await authCaller(technician);
    await techCaller.bookings.transition({ id: booking.id, action: 'accept' });
    // ACCEPTED -> ACCEPTED is not a valid transition
    await expect(
      techCaller.bookings.transition({ id: booking.id, action: 'accept' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('should run the full REQUESTED -> ACCEPTED -> IN_PROGRESS -> COMPLETED lifecycle', async () => {
    const booking = await createBooking();
    const techCaller = await authCaller(technician);
    await techCaller.bookings.transition({ id: booking.id, action: 'accept' });
    await techCaller.bookings.transition({ id: booking.id, action: 'start' });
    const completed = await techCaller.bookings.transition({
      id: booking.id,
      action: 'complete',
    });
    expect(completed.status).toBe('COMPLETED');

    // Completion increments the technician's completedBookings counter
    const tech = await prisma.technician.findUnique({
      where: { id: technicianRecordId },
    });
    expect(tech!.completedBookings).toBeGreaterThan(0);
  });

  it('should let the customer cancel an ACCEPTED booking and free the slot', async () => {
    const slotId = await seedSlot();
    const booking = await createBooking({ slotId });
    const techCaller = await authCaller(technician);
    await techCaller.bookings.transition({ id: booking.id, action: 'accept' });

    const customerCaller = await authCaller(customer);
    const cancelled = await customerCaller.bookings.transition({
      id: booking.id,
      action: 'cancel',
      reason: 'تغيرت الخطط',
    });
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancelledAt).toBeDefined();

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
    expect(slot?.isBooked).toBe(false);
  });

  it('should let the technician reject a REQUESTED booking and free the slot', async () => {
    const slotId = await seedSlot();
    const booking = await createBooking({ slotId });
    const techCaller = await authCaller(technician);
    const rejected = await techCaller.bookings.transition({
      id: booking.id,
      action: 'reject',
    });
    expect(rejected.status).toBe('REJECTED');

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
    expect(slot?.isBooked).toBe(false);
  });

  it('should let the owner read the booking but forbid strangers', async () => {
    const booking = await createBooking();
    const ownerCaller = await authCaller(customer);
    const detail = await ownerCaller.bookings.getById({ id: booking.id });
    expect(detail.id).toBe(booking.id);

    const stranger = await authCaller(otherCustomer);
    await expect(stranger.bookings.getById({ id: booking.id })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('should list own bookings and filter by status', async () => {
    const booking = await createBooking();
    const caller = await authCaller(customer);
    const list = await caller.bookings.list({ page: 1, limit: 50 });
    const items = (list.bookings ?? list.items) as any[];
    expect(items.some((b: any) => b.id === booking.id)).toBe(true);

    const filtered = await caller.bookings.list({ page: 1, limit: 50, status: 'REQUESTED' });
    const filteredItems = (filtered.bookings ?? filtered.items) as any[];
    expect(filteredItems.every((b: any) => b.status === 'REQUESTED')).toBe(true);
  });

  it('should show pending bookings to the involved technician', async () => {
    await createBooking();
    const techCaller = await authCaller(technician);
    const pending = await techCaller.bookings.getTechnicianPending();
    expect(Array.isArray(pending)).toBe(true);
    expect(pending.length).toBeGreaterThan(0);
    // The procedure caps at 50 and orders by startAt — parallel test files
    // create bookings for the same technician, so assert the invariant
    // rather than membership of a specific booking.
    expect(
      pending.every((b: any) => b.status === 'REQUESTED' && b.technicianId === technicianUserId),
    ).toBe(true);
  });

  it('should return a timeline for a booking', async () => {
    const booking = await createBooking();
    const caller = await authCaller(customer);
    const timeline = await caller.bookings.getTimeline({ bookingId: booking.id });
    expect(timeline).toBeDefined();
  });
});
