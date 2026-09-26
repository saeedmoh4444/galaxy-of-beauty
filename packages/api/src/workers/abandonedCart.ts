/**
 * 8.3 Email & Push Marketing Automation — abandoned cart.
 *
 * Daily sweep: non-empty carts whose latest item is older than
 * CART_ABANDON_HOURS get a "your cart is waiting" nudge with a fresh 10%
 * promo code valid for 24h. Throttled by the notification trail — at most
 * one message per user per 24h, no schema changes needed.
 */
import { prisma } from '@galaxy/db';
import { notifyUser } from '../lib/notify';

const SWEEP_INTERVAL_MS = 3_600_000 * 24; // daily
export const CART_ABANDON_HOURS = 24;
const CODE_VALID_HOURS = 24;

/** True when the last cart touch is older than the window. */
export function isAbandoned(
  lastTouch: Date,
  now: Date = new Date(),
  hours: number = CART_ABANDON_HOURS,
): boolean {
  return now.getTime() - lastTouch.getTime() > hours * 3_600_000;
}

export async function sendAbandonedCartEmails(): Promise<number> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - CART_ABANDON_HOURS * 3_600_000);

  const grouped = await prisma.cartItem.groupBy({
    by: ['userId'],
    _max: { createdAt: true },
  });

  let sent = 0;
  for (const g of grouped) {
    const lastTouch = g._max.createdAt;
    if (!lastTouch || !isAbandoned(lastTouch, now)) continue;

    // Throttle: a cart_abandoned message within the window = already nudged.
    const recent = await prisma.notification.findFirst({
      where: { userId: g.userId, type: 'cart_abandoned', createdAt: { gte: cutoff } },
    });
    if (recent) continue;

    const user = await prisma.user.findUnique({
      where: { id: g.userId },
      select: { name: true },
    });
    if (!user) continue;

    const code = `CART${g.userId}${Date.now().toString(36).toUpperCase()}`;
    await prisma.promoCode.create({
      data: {
        code,
        discountType: 'percent',
        discountValue: 10,
        maxUses: 1,
        validFrom: now,
        validUntil: new Date(now.getTime() + CODE_VALID_HOURS * 3_600_000),
        isActive: true,
        createdBy: g.userId, // system-issued, scoped to the cart owner
      },
    });

    await notifyUser({
      userId: g.userId,
      templateKey: 'cart_abandoned',
      vars: { customerName: user.name ?? '', code, discount: 10 },
      link: '/marketplace',
    });
    sent++;
  }
  return sent;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startAbandonedCart(): void {
  if (intervalId) return;
  void sendAbandonedCartEmails();
  intervalId = setInterval(() => {
    void sendAbandonedCartEmails();
  }, SWEEP_INTERVAL_MS);
}

export function stopAbandonedCart(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
