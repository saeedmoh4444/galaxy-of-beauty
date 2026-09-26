/**
 * ENHANCEMENT_PLAN 8.3 — slice D: post-booking review request.
 *
 * Drives: the pure due-window helper, and the daily sweep — completed
 * bookings whose appointment ended 2–26 hours ago get a "how was your
 * experience?" request + next-booking suggestion, once, unless they
 * already reviewed or were already asked.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';
import { isReviewDue, sendPostBookingEmails } from '../workers/postBooking';

const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];
let dueBookingId = 0;
let tooFreshBookingId = 0;
let reviewedBookingId = 0;
let askedBookingId = 0;

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);

beforeAll(async () => {
  await prisma.notificationTemplate.upsert({
    where: { key: 'post_booking_review' },
    update: {},
    create: {
      key: 'post_booking_review',
      category: 'bookingReminders',
      channels: ['in_app', 'push'],
      titleJson: { ar: 'كيف كانت تجربتك؟', en: 'How Was Your Experience?' },
      bodyJson: { ar: '{{customerName}}', en: '{{customerName}}' },
    },
  });

  const tech = await prisma.technician.findFirst({ select: { userId: true } });
  const service = await prisma.service.findFirst({ select: { id: true } });
  const address = await prisma.address.findFirst({ select: { id: true } });

  const mkBooking = async (endAt: Date) => {
    const u = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(u.id);
    const b = await prisma.booking.create({
      data: {
        bookingCode: `PB-${Date.now()}-${createdBookingIds.length}`,
        customerId: u.id,
        technicianId: tech?.userId ?? 1,
        serviceId: service?.id ?? 1,
        addressId: address?.id ?? 1,
        startAt: new Date(endAt.getTime() - 3_600_000),
        endAt,
        status: 'COMPLETED',
        totalAmount: 100,
        platformFee: 0,
        paymentFee: 0,
        cashHandlingFee: 0,
        idempotencyKey: `pb-${Date.now()}-${createdBookingIds.length}`,
      },
    });
    createdBookingIds.push(b.id);
    return { u, b };
  };

  const due = await mkBooking(hoursAgo(5));
  dueBookingId = due.b.id;

  const fresh = await mkBooking(hoursAgo(1));
  tooFreshBookingId = fresh.b.id;

  const reviewed = await mkBooking(hoursAgo(5));
  reviewedBookingId = reviewed.b.id;
  await prisma.review.create({
    data: {
      bookingId: reviewed.b.id,
      customerId: reviewed.u.id,
      rating: 5,
      comment: 'رائع',
    },
  });

  const asked = await mkBooking(hoursAgo(5));
  askedBookingId = asked.b.id;
  await prisma.notification.create({
    data: {
      userId: asked.u.id,
      type: 'post_booking_review',
      titleJson: { ar: 'x', en: 'x' },
      bodyJson: { ar: 'x', en: 'x' },
      sentVia: ['in_app'],
      link: `/bookings/${asked.b.id}`,
    },
  });
}, 30000);

afterAll(async () => {
  try {
    await prisma.review.deleteMany({ where: { bookingId: { in: createdBookingIds } } });
    await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort
  }
});

describe('isReviewDue', () => {
  it('matches bookings that ended 2–26 hours ago', () => {
    expect(isReviewDue(hoursAgo(5))).toBe(true);
    expect(isReviewDue(hoursAgo(2.5))).toBe(true);
    expect(isReviewDue(hoursAgo(1))).toBe(false);
    expect(isReviewDue(hoursAgo(30))).toBe(false);
  });
});

describe('sendPostBookingEmails', () => {
  it('asks once per due booking and skips reviewed/asked/fresh', async () => {
    const count = await sendPostBookingEmails();
    expect(count).toBeGreaterThanOrEqual(1);

    const due = await prisma.notification.findFirst({
      where: { type: 'post_booking_review', link: `/bookings/${dueBookingId}` },
    });
    expect(due).not.toBeNull();

    const reviewed = await prisma.notification.findFirst({
      where: { type: 'post_booking_review', link: `/bookings/${reviewedBookingId}` },
    });
    expect(reviewed).toBeNull();

    const fresh = await prisma.notification.findFirst({
      where: { type: 'post_booking_review', link: `/bookings/${tooFreshBookingId}` },
    });
    expect(fresh).toBeNull();

    // Asked booking keeps exactly its manual marker row.
    const asked = await prisma.notification.count({
      where: { type: 'post_booking_review', link: `/bookings/${askedBookingId}` },
    });
    expect(asked).toBe(1);
  });

  it('does not re-ask on the next sweep', async () => {
    await sendPostBookingEmails();
    const rows = await prisma.notification.count({
      where: { type: 'post_booking_review', link: `/bookings/${dueBookingId}` },
    });
    expect(rows).toBe(1);
  });
});
