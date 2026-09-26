/**
 * 8.3 Email & Push Marketing Automation — re-engagement.
 *
 * Daily sweep: customers with no booking in INACTIVE_DAYS days get a
 * "we miss you" nudge with a free add-on incentive — at most once a
 * month (User.lastReengagementAt throttle).
 */
import { prisma } from '@galaxy/db';
import { notifyUser } from '../lib/notify';

const SWEEP_INTERVAL_MS = 3_600_000 * 24; // daily
export const INACTIVE_DAYS = 30;
const THROTTLE_DAYS = 30;

/** True when the last booking is missing or older than the window. */
export function isInactiveFor(
  lastBookingAt: Date | null,
  inactiveDays: number = INACTIVE_DAYS,
  now: Date = new Date(),
): boolean {
  if (!lastBookingAt) return true;
  return now.getTime() - lastBookingAt.getTime() > inactiveDays * 86_400_000;
}

export async function sendReengagementEmails(): Promise<number> {
  const now = new Date();
  const throttleCutoff = new Date(now.getTime() - THROTTLE_DAYS * 86_400_000);

  const candidates = await prisma.user.findMany({
    where: {
      role: 'CUSTOMER',
      OR: [{ lastReengagementAt: null }, { lastReengagementAt: { lt: throttleCutoff } }],
    },
    select: { id: true, name: true },
  });

  let sent = 0;
  for (const u of candidates) {
    const lastBooking = await prisma.booking.findFirst({
      where: { customerId: u.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (!isInactiveFor(lastBooking?.createdAt ?? null, INACTIVE_DAYS, now)) continue;

    await notifyUser({
      userId: u.id,
      templateKey: 'reengagement_30d',
      vars: { customerName: u.name ?? '' },
      link: '/bookings/create',
    });
    await prisma.user.update({
      where: { id: u.id },
      data: { lastReengagementAt: now },
    });
    sent++;
  }
  return sent;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startReengagement(): void {
  if (intervalId) return;
  void sendReengagementEmails();
  intervalId = setInterval(() => {
    void sendReengagementEmails();
  }, SWEEP_INTERVAL_MS);
}

export function stopReengagement(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
