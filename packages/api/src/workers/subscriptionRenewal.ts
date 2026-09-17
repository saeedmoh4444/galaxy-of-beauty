/**
 * Beauty Subscription renewal engine (ENHANCEMENT_PLAN 2.2 SUB-2).
 *
 * Daily sweep (setInterval, same pattern as tokenCleanup):
 *   - ACTIVE subscriptions past currentPeriodEnd:
 *       autoRenew=true  → roll the period (MONTHLY +1m, YEARLY +1y) and
 *                         reset bookingsThisMonth
 *       autoRenew=false → EXPIRED
 *   - 3-day reminder: ACTIVE autoRenew subscriptions ending within
 *     3 days get an in-app notification
 * Exported functions are pure and tested directly.
 */
import { prisma } from '@galaxy/db';
import { notifyUser } from '../lib/notify';

const RENEWAL_INTERVAL_MS = 3_600_000 * 24; // daily
const REMINDER_DAYS = 3;

function rollPeriod(end: Date, interval: string): Date {
  const next = new Date(end);
  if (interval === 'YEARLY') next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

/** Renew or expire due subscriptions. Returns { renewed, expired }. */
export async function renewDueSubscriptions(): Promise<{ renewed: number; expired: number }> {
  const now = new Date();
  const due = await prisma.customerSubscription.findMany({
    where: { status: 'ACTIVE', currentPeriodEnd: { lte: now } },
    include: { plan: { select: { interval: true } } },
  });

  let renewed = 0;
  let expired = 0;
  for (const sub of due) {
    if (sub.autoRenew) {
      const nextEnd = rollPeriod(sub.currentPeriodEnd, sub.plan.interval);
      await prisma.customerSubscription.update({
        where: { id: sub.id },
        data: {
          currentPeriodStart: sub.currentPeriodEnd,
          currentPeriodEnd: nextEnd,
          bookingsThisMonth: 0,
        },
      });
      renewed++;
    } else {
      await prisma.customerSubscription.update({
        where: { id: sub.id },
        data: { status: 'EXPIRED' },
      });
      expired++;
    }
  }
  return { renewed, expired };
}

/** Notify owners of subscriptions renewing within REMINDER_DAYS days. */
export async function sendRenewalReminders(): Promise<number> {
  const now = new Date();
  const soon = new Date(now.getTime() + REMINDER_DAYS * 86_400_000);
  const due = await prisma.customerSubscription.findMany({
    where: {
      status: 'ACTIVE',
      autoRenew: true,
      currentPeriodEnd: { gt: now, lte: soon },
    },
    include: {
      plan: { select: { nameJson: true, price: true } },
      user: { select: { name: true } },
    },
  });

  for (const sub of due) {
    await notifyUser({
      userId: sub.userId,
      templateKey: 'subscription_renewal_reminder',
      vars: {
        customerName: sub.user.name ?? '',
        planName: String((sub.plan.nameJson as { ar?: string })?.ar ?? ''),
        price: Number(sub.plan.price),
      },
      link: '/subscription-boxes',
    });
  }
  return due.length;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startSubscriptionRenewal(): void {
  if (intervalId) return;
  void renewDueSubscriptions();
  void sendRenewalReminders();
  intervalId = setInterval(() => {
    void renewDueSubscriptions();
    void sendRenewalReminders();
  }, RENEWAL_INTERVAL_MS);
  console.log(`[SubscriptionRenewal] Scheduled daily (${RENEWAL_INTERVAL_MS / 1000}s)`);
}

export function stopSubscriptionRenewal(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
