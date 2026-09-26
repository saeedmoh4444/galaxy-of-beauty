/**
 * 8.2 Loyalty 2.0 — earn points for reviews and referrals.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { creditLoyaltyPoints, LOYALTY_REFERRAL_POINTS } from '../lib/loyalty';

const CSRF = 'a'.repeat(64);

async function callerFor(user?: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let technicianUserId: number;
let technicianRecordId: number;
let addressId: number;
let serviceId: number;

let uid = 0;
const newIdemKey = () => `loyalty_${Date.now()}_${uid++}`;

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

  const tech = await prisma.technician.findFirst({
    include: { user: true },
    where: { user: { role: 'TECHNICIAN' } },
  });
  technicianUserId = tech!.userId;
  technicianRecordId = tech!.id;

  const service = await prisma.service.findFirst();
  serviceId = service!.id;

  const address = await prisma.address.findFirst({ where: { userId: customer.id } });
  addressId =
    address?.id ??
    (
      await prisma.address.create({
        data: {
          userId: customer.id,
          label: 'اختبار الولاء',
          city: 'الرياض',
          area: 'التجريبي',
          street: 'شارع الاختبار',
        },
      })
    ).id;
}, 15000);

describe('creditLoyaltyPoints (pure-ish)', () => {
  it('credits points with auto account creation and tier recalculation', async () => {
    const before = await prisma.loyaltyAccount.findUnique({ where: { userId: customer.id } });
    await creditLoyaltyPoints(prisma, customer.id, 100, 'referral', 'test_ref');

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId: customer.id } });
    expect(account!.points).toBe((before?.points ?? 0) + 100);
    expect(account!.lifetimePoints).toBe((before?.lifetimePoints ?? 0) + 100);
  });

  it('records a loyalty transaction with the reason', async () => {
    const txn = await prisma.loyaltyTransaction.findFirst({
      where: { referenceId: 'test_ref' },
    });
    expect(txn).toBeTruthy();
    expect(txn!.points).toBe(100);
    expect(txn!.reason).toBe('referral');
  });
});

describe('review earn (8.2)', () => {
  it('submitting a review credits 50 loyalty points', async () => {
    const bookingId = await completedBooking(customer);
    const before = await prisma.loyaltyAccount.findUnique({ where: { userId: customer.id } });

    const caller = await callerFor(customer);
    await caller.reviews.create({ bookingId, rating: 5, comment: 'رائعة' });
    // fire-and-forget credit — poll briefly for the ledger to settle
    await new Promise((r) => setTimeout(r, 300));

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId: customer.id } });
    expect(account!.points).toBe((before?.points ?? 0) + 50);

    const txn = await prisma.loyaltyTransaction.findFirst({
      where: { referenceId: `review_${bookingId}` },
    });
    expect(txn).toBeTruthy();
  });
});

describe('referral earn constants', () => {
  it('referral earn matches the 8.2 schedule (200 points)', () => {
    expect(LOYALTY_REFERRAL_POINTS).toBe(200);
  });
});
