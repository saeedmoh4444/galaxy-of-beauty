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

type LoyaltyClient = Pick<
  Prisma.TransactionClient,
  'loyaltyAccount' | 'loyaltyTransaction' | '$transaction'
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

  const newPoints = account.points + points;
  const lifetimePoints = account.lifetimePoints + (points > 0 ? points : 0);

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
        points,
        reason,
        referenceId,
      },
    }),
  ]);
  return { points: newPoints, tier };
}

/** 8.2 earn schedule: reviews and referrals (booking points ride the worker). */
export const LOYALTY_REVIEW_POINTS = 50;
export const LOYALTY_REFERRAL_POINTS = 200;
