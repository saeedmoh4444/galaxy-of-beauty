/**
 * NPS post-booking survey (ENHANCEMENT_PLAN quick win #6).
 * Coverage ratchet target: src/routers/nps.ts
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);

async function callerFor(user?: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let otherCustomer: JwtPayload;
let technicianUserId: number;
let technicianRecordId: number;
let addressId: number;
let serviceId: number;

let uid = 0;
const newIdemKey = () => `nps_${Date.now()}_${uid++}`;

/** Create + drive a booking to COMPLETED; returns the booking id. */
async function completedBooking(customerUser: JwtPayload): Promise<number> {
  const slot = await prisma.availabilitySlot.create({
    data: {
      technicianId: technicianRecordId,
      startAt: new Date(Date.now() + 86400000 + uid * 3600000),
      endAt: new Date(Date.now() + 86400000 + uid * 3600000 + 3600000),
      isBooked: false,
    },
  });
  const customerCaller = await callerFor(customerUser);
  const booking = await customerCaller.bookings.create({
    serviceId,
    technicianId: technicianUserId,
    addressId,
    slotId: slot.id,
    startAt: slot.startAt.toISOString(),
    endAt: slot.endAt.toISOString(),
    idempotencyKey: newIdemKey(),
  });
  const tech = await prisma.technician.findUnique({
    where: { id: technicianRecordId },
    include: { user: true },
  });
  const techCaller = await callerFor({
    id: tech!.userId,
    role: 'TECHNICIAN',
    email: tech!.user.email,
  });
  await techCaller.bookings.transition({ id: booking.id, action: 'accept' });
  await techCaller.bookings.transition({ id: booking.id, action: 'start' });
  await techCaller.bookings.transition({ id: booking.id, action: 'complete' });
  return booking.id;
}

beforeAll(async () => {
  const anon = await callerFor();
  const login = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  customer = { id: login.user.id, role: login.user.role, email: login.user.email };

  const other = await prisma.user.findFirst({
    where: { role: 'CUSTOMER', id: { not: customer.id } },
  });
  if (!other) throw new Error('No second customer in seed data');
  otherCustomer = { id: other.id, role: other.role, email: other.email };

  const tech = await prisma.technician.findFirst({
    include: { user: true },
    where: { user: { role: 'TECHNICIAN' } },
  });
  if (!tech) throw new Error('No technician in seed data');
  technicianUserId = tech.userId;
  technicianRecordId = tech.id;

  const service = await prisma.service.findFirst();
  serviceId = service!.id;

  const address = await prisma.address.findFirst({ where: { userId: customer.id } });
  addressId =
    address?.id ??
    (
      await prisma.address.create({
        data: {
          userId: customer.id,
          label: 'اختبار NPS',
          city: 'الرياض',
          area: 'التجريبي',
          street: 'شارع الاختبار',
        },
      })
    ).id;
}, 15000);

describe('NPS survey', () => {
  it('accepts a score + comment for a completed booking the customer owns', async () => {
    const bookingId = await completedBooking(customer);
    const caller = await callerFor(customer);
    const res = await caller.nps.submit({
      bookingId,
      score: 9,
      comment: 'خدمة ممتازة',
    });
    expect(res.id).toBeGreaterThan(0);
    expect(res.score).toBe(9);
  });

  it('rejects out-of-range scores', async () => {
    const caller = await callerFor(customer);
    await expect(caller.nps.submit({ score: 11 })).rejects.toThrow();
    await expect(caller.nps.submit({ score: -1 })).rejects.toThrow();
  });

  it('rejects ratings for bookings that are not completed', async () => {
    // A REQUESTED booking (never transitioned).
    const slot = await prisma.availabilitySlot.create({
      data: {
        technicianId: technicianRecordId,
        startAt: new Date(Date.now() + 86400000 + uid * 3600000),
        endAt: new Date(Date.now() + 86400000 + uid * 3600000 + 3600000),
        isBooked: false,
      },
    });
    const customerCaller = await callerFor(customer);
    const booking = await customerCaller.bookings.create({
      serviceId,
      technicianId: technicianUserId,
      addressId,
      slotId: slot.id,
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
      idempotencyKey: newIdemKey(),
    });

    await expect(customerCaller.nps.submit({ bookingId: booking.id, score: 8 })).rejects.toThrow();
  });

  it('rejects rating someone else’s booking', async () => {
    const bookingId = await completedBooking(customer);
    const intruder = await callerFor(otherCustomer);
    await expect(intruder.nps.submit({ bookingId, score: 8 })).rejects.toThrow();
  });

  it('dedupes per booking — second submit is rejected', async () => {
    const bookingId = await completedBooking(customer);
    const caller = await callerFor(customer);
    await caller.nps.submit({ bookingId, score: 7 });
    await expect(caller.nps.submit({ bookingId, score: 10 })).rejects.toThrow();
  });

  it('exposes admin stats with average + distribution', async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const adminCaller = await callerFor({
      id: admin!.id,
      role: 'ADMIN',
      email: admin!.email,
    });
    const stats = await adminCaller.nps.stats({});
    expect(stats).toHaveProperty('average');
    expect(stats).toHaveProperty('total');
    expect(stats.distribution).toHaveProperty('detractors');
    expect(stats.distribution).toHaveProperty('passives');
    expect(stats.distribution).toHaveProperty('promoters');
    expect(Number.isFinite(stats.average)).toBe(true);
  });

  it('lists the customer’s own responses', async () => {
    const caller = await callerFor(customer);
    const mine = await caller.nps.mine({});
    expect(Array.isArray(mine)).toBe(true);
  });

  // ── 4.3 Customer Feedback Loop ──────────────────────────

  it('a detractor score (≤ 6) alerts every admin to follow up within 24h', async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    expect(admin).toBeTruthy();

    const bookingId = await completedBooking(customer);
    const caller = await callerFor(customer);
    const res = await caller.nps.submit({
      bookingId,
      score: 4,
      comment: 'التجربة كانت سيئة',
    });
    expect(res.score).toBe(4);

    const alert = await prisma.notification.findFirst({
      where: { userId: admin!.id, type: 'nps_detractor' },
      orderBy: { createdAt: 'desc' },
    });
    expect(alert).toBeTruthy();
  });

  it('a promoter score (≥ 9) does not alert admins', async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const before = await prisma.notification.count({
      where: { userId: admin!.id, type: 'nps_detractor' },
    });

    const bookingId = await completedBooking(customer);
    const caller = await callerFor(customer);
    await caller.nps.submit({ bookingId, score: 10 });

    const after = await prisma.notification.count({
      where: { userId: admin!.id, type: 'nps_detractor' },
    });
    expect(after).toBe(before);
  });

  it('markFollowedUp stamps the loop-closing timestamp', async () => {
    const bookingId = await completedBooking(customer);
    const caller = await callerFor(customer);
    const res = await caller.nps.submit({ bookingId, score: 3 });

    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const adminCaller = await callerFor({ id: admin!.id, role: 'ADMIN', email: admin!.email });
    const updated = await adminCaller.nps.markFollowedUp({ responseId: res.id });
    expect(updated.followedUpAt).toBeInstanceOf(Date);

    const row = await prisma.npsResponse.findUnique({ where: { id: res.id } });
    expect(row!.followedUpAt).toBeInstanceOf(Date);
  });

  it('byTechnician aggregates scores from the technician’s bookings', async () => {
    const bookingId = await completedBooking(customer);
    const caller = await callerFor(customer);
    await caller.nps.submit({ bookingId, score: 9 });

    const anon = await callerFor();
    // Booking.technicianId stores the technician's USER id (house convention).
    const agg = await anon.nps.byTechnician({ technicianId: technicianUserId });
    expect(agg.total).toBeGreaterThanOrEqual(1);
    expect(agg.average).toBeGreaterThanOrEqual(0);
    expect(agg.distribution.promoters).toBeGreaterThanOrEqual(1);
  });
});
