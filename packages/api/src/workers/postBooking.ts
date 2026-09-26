/**
 * 8.3 Email & Push Marketing Automation — post-booking review request.
 *
 * Daily sweep: completed bookings whose appointment ended 2–26 hours ago
 * get a "how was your experience?" request with a next-booking
 * suggestion — once, unless they already reviewed or were asked before.
 */
import { prisma } from '@galaxy/db';
import { notifyUser } from '../lib/notify';

const SWEEP_INTERVAL_MS = 3_600_000 * 24; // daily
export const REVIEW_DUE_MIN_HOURS = 2;
export const REVIEW_DUE_MAX_HOURS = 26;

/** True when the appointment ended inside the request window. */
export function isReviewDue(
  endAt: Date,
  now: Date = new Date(),
  minHours: number = REVIEW_DUE_MIN_HOURS,
  maxHours: number = REVIEW_DUE_MAX_HOURS,
): boolean {
  const since = now.getTime() - endAt.getTime();
  return since > minHours * 3_600_000 && since <= maxHours * 3_600_000;
}

export async function sendPostBookingEmails(): Promise<number> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - REVIEW_DUE_MAX_HOURS * 3_600_000);

  const completed = await prisma.booking.findMany({
    where: {
      status: 'COMPLETED',
      endAt: { gte: windowStart, lte: now },
    },
    include: {
      customer: { select: { name: true } },
      review: { select: { id: true } },
    },
  });

  let sent = 0;
  for (const b of completed) {
    if (!isReviewDue(b.endAt, now)) continue;
    if (b.review) continue;

    const link = `/bookings/${b.id}`;
    const alreadyAsked = await prisma.notification.findFirst({
      where: { userId: b.customerId, type: 'post_booking_review', link },
    });
    if (alreadyAsked) continue;

    await notifyUser({
      userId: b.customerId,
      templateKey: 'post_booking_review',
      vars: { customerName: b.customer.name ?? '' },
      link,
    });
    sent++;
  }
  return sent;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startPostBooking(): void {
  if (intervalId) return;
  void sendPostBookingEmails();
  intervalId = setInterval(() => {
    void sendPostBookingEmails();
  }, SWEEP_INTERVAL_MS);
}

export function stopPostBooking(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
