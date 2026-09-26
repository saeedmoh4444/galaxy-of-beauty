/**
 * 8.2 Loyalty 2.0 — points economy helper.
 *
 * Credit (or debit) loyalty points with account auto-create and tier
 * recalculation. Mirrors the worker's handleLoyaltyJob logic so every
 * earn path (booking, review, referral, …) uses one implementation.
 * Accepts a Prisma client (or transaction client) so it composes inside
 * existing transactions.
 */
import type { Prisma } from '@galaxy/db';
import { pointsExpiryDate, boostedPoints } from '@galaxy/shared';

type LoyaltyClient = Pick<
  Prisma.TransactionClient,
  'loyaltyAccount' | 'loyaltyTransaction' | 'loyaltyBoost' | '$transaction'
>;

export async function creditLoyaltyPoints(
  client: LoyaltyClient,
  userId: number,
  points: number,
  reason: string,
  referenceId?: string,
): Promise<{ points: number; tier: string }> {
  let account = await client.loyaltyAccount.findUnique({ where: { userId } });
  if (!account) {
    account = await client.loyaltyAccount.create({
      data: { userId, points: 0, lifetimePoints: 0, tier: 'SILVER' },
    });
  }

  // 8.2: positive earns carry a 12-month expiry and ride any active boost
  // window (highest multiplier wins when windows overlap).
  let finalPoints = points;
  let expiresAt: Date | null = null;
  if (points > 0) {
    expiresAt = pointsExpiryDate();
    const boost = await client.loyaltyBoost.findFirst({
      where: {
        isActive: true,
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      },
      orderBy: { multiplier: 'desc' },
    });
    if (boost) finalPoints = boostedPoints(points, Number(boost.multiplier));
  }

  const newPoints = account.points + finalPoints;
  const lifetimePoints = account.lifetimePoints + (finalPoints > 0 ? finalPoints : 0);

  let tier = 'SILVER';
  if (lifetimePoints >= 2000) tier = 'PLATINUM';
  else if (lifetimePoints >= 500) tier = 'GOLD';

  await client.$transaction([
    client.loyaltyAccount.update({
      where: { userId },
      data: { points: newPoints, lifetimePoints, tier },
    }),
    client.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        points: finalPoints,
        reason,
        referenceId,
        expiresAt,
      },
    }),
  ]);
  return { points: newPoints, tier };
}

/** 8.2 earn schedule: reviews and referrals (booking points ride the worker). */
export const LOYALTY_REVIEW_POINTS = 50;
export const LOYALTY_REFERRAL_POINTS = 200;
