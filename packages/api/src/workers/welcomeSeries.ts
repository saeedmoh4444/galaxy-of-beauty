/**
 * 8.3 Email & Push Marketing Automation — welcome series.
 *
 * Day 0 fires at signup (register hook); days 1/3/7 ride the daily sweep
 * (same pattern as tokenCleanup / subscriptionRenewal / loyaltyExpiry).
 * The age-bucket math makes the sweep naturally idempotent — each member
 * matches exactly one day, on exactly one sweep.
 */
import { prisma } from '@galaxy/db';
import { notifyUser } from '../lib/notify';

const WELCOME_INTERVAL_MS = 3_600_000 * 24; // daily
const WELCOME_DAYS = [1, 3, 7] as const;
const DAY_LINK: Record<number, string> = {
  1: '/services',
  3: '/marketplace',
  7: '/bookings/create',
};

/** Membership-age bucket: 1, 3, or 7 days — null otherwise (day 0 = signup). */
export function welcomeDayFor(createdAt: Date, now: Date = new Date()): number | null {
  const days = Math.floor((now.getTime() - createdAt.getTime()) / 86_400_000);
  return (WELCOME_DAYS as readonly number[]).includes(days) ? days : null;
}

/** Day 0 — called from the register flow the moment the account exists. */
export async function sendWelcomeDay0(userId: number, customerName: string): Promise<void> {
  await notifyUser({
    userId,
    templateKey: 'welcome_day0',
    vars: { customerName },
    link: '/beauty-discovery',
  });
}

/** Daily sweep: platform intro (d1), service highlight (d3), booking offer (d7). */
export async function sendWelcomeSeriesEmails(): Promise<number> {
  const since = new Date(Date.now() - 8 * 86_400_000);
  const recent = await prisma.user.findMany({
    where: { createdAt: { gte: since } },
    select: { id: true, name: true, createdAt: true },
  });

  let sent = 0;
  for (const u of recent) {
    const day = welcomeDayFor(u.createdAt);
    if (!day) continue;
    await notifyUser({
      userId: u.id,
      templateKey: `welcome_day${day}`,
      vars: { customerName: u.name ?? '' },
      link: DAY_LINK[day],
    });
    sent++;
  }
  return sent;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startWelcomeSeries(): void {
  if (intervalId) return;
  void sendWelcomeSeriesEmails();
  intervalId = setInterval(() => {
    void sendWelcomeSeriesEmails();
  }, WELCOME_INTERVAL_MS);
}

export function stopWelcomeSeries(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
