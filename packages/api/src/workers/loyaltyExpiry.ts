/**
 * 8.2 Loyalty 2.0 — expiry sweep + reminders.
 *
 * Daily sweep (setInterval, same pattern as tokenCleanup /
 * subscriptionRenewal):
 *   - sweepExpiredLoyaltyPoints: reconcile each account whose ledger still
 *     counts expired points down to its effective balance (idempotent —
 *     unchanged accounts are skipped)
 *   - sendLoyaltyExpiryReminders: 30-day heads-up via the template-driven
 *     notification system (one notification per account)
 * Exported functions are pure and tested directly.
 */
import { prisma } from '@galaxy/db';
import { notifyUser } from '../lib/notify';

const SWEEP_INTERVAL_MS = 3_600_000 * 24; // daily
const REMINDER_DAYS = 30;

/** Reconcile ledgers still counting expired points. Idempotent. */
export async function sweepExpiredLoyaltyPoints(): Promise<{
  accounts: number;
  pointsSwept: number;
}> {
  const now = new Date();
  const expired = await prisma.loyaltyTransaction.groupBy({
    by: ['accountId'],
    where: { points: { gt: 0 }, expiresAt: { lt: now } },
  });
  if (expired.length === 0) return { accounts: 0, pointsSwept: 0 };

  let accounts = 0;
  let pointsSwept = 0;
  for (const { accountId } of expired) {
    const account = await prisma.loyaltyAccount.findUnique({ where: { id: accountId } });
    if (!account) continue;
    const txns = await prisma.loyaltyTransaction.findMany({
      where: { accountId },
      select: { points: true, expiresAt: true },
    });
    const effective = txns.reduce(
      (sum, t) => (t.expiresAt === null || t.expiresAt > now ? sum + t.points : sum),
      0,
    );
    if (effective === account.points) continue;
    const swept = account.points - effective;
    await prisma.loyaltyAccount.update({
      where: { id: accountId },
      data: { points: effective },
    });
    accounts++;
    pointsSwept += swept;
  }
  return { accounts, pointsSwept };
}

/** Notify owners of positive points expiring within REMINDER_DAYS days. */
export async function sendLoyaltyExpiryReminders(): Promise<number> {
  const now = new Date();
  const soon = new Date(now.getTime() + REMINDER_DAYS * 86_400_000);
  const txns = await prisma.loyaltyTransaction.findMany({
    where: { points: { gt: 0 }, expiresAt: { gt: now, lte: soon } },
    select: { accountId: true, points: true, expiresAt: true },
    orderBy: { expiresAt: 'asc' },
  });
  if (txns.length === 0) return 0;

  // One notification per account: sum + earliest expiry.
  const byAccount = new Map<number, { points: number; expiresAt: Date }>();
  for (const t of txns) {
    const cur = byAccount.get(t.accountId);
    if (cur) {
      cur.points += t.points;
      if (t.expiresAt! < cur.expiresAt) cur.expiresAt = t.expiresAt!;
    } else {
      byAccount.set(t.accountId, { points: t.points, expiresAt: t.expiresAt! });
    }
  }

  let sent = 0;
  for (const [accountId, agg] of byAccount) {
    const account = await prisma.loyaltyAccount.findUnique({
      where: { id: accountId },
      include: { user: { select: { name: true } } },
    });
    if (!account) continue;
    await notifyUser({
      userId: account.userId,
      templateKey: 'loyalty_points_expiring',
      vars: {
        customerName: account.user.name ?? '',
        points: agg.points,
        date: agg.expiresAt.toLocaleDateString('ar-SA'),
      },
      link: '/loyalty',
    });
    sent++;
  }
  return sent;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startLoyaltyExpirySweep(): void {
  if (intervalId) return;
  void sweepExpiredLoyaltyPoints();
  void sendLoyaltyExpiryReminders();
  intervalId = setInterval(() => {
    void sweepExpiredLoyaltyPoints();
    void sendLoyaltyExpiryReminders();
  }, SWEEP_INTERVAL_MS);
}

export function stopLoyaltyExpirySweep(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
