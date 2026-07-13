import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { protectedProcedure, adminProcedure, router } from '../trpc';

// ── Tier thresholds & multipliers ──────────────────────────

const TIERS = {
  SILVER:   { min: 0,      multiplier: 1, nameAr: 'فضية',   nameEn: 'Silver' },
  GOLD:     { min: 500,    multiplier: 1.5, nameAr: 'ذهبية', nameEn: 'Gold' },
  PLATINUM: { min: 2000,   multiplier: 2, nameAr: 'بلاتينية', nameEn: 'Platinum' },
};

// Points per 1 SAR spent (configurable)
const POINTS_PER_SAR = 10;

function getTier(lifetimePoints: number): string {
  if (lifetimePoints >= TIERS.PLATINUM.min) return 'PLATINUM';
  if (lifetimePoints >= TIERS.GOLD.min) return 'GOLD';
  return 'SILVER';
}

async function getOrCreateAccount(userId: number) {
  let account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
  if (!account) {
    account = await prisma.loyaltyAccount.create({ data: { userId } });
  }
  return account;
}

// ── Router ─────────────────────────────────────────────────

export const loyaltyRouter = router({
  // ── Get current account status ──────────────────────────
  myAccount: protectedProcedure.query(async ({ ctx }) => {
    const account = await getOrCreateAccount(ctx.user.id);
    const tier = TIERS[account.tier as keyof typeof TIERS] || TIERS.SILVER;

    return {
      points: account.points,
      tier: account.tier,
      tierNameAr: tier.nameAr,
      tierNameEn: tier.nameEn,
      lifetimePoints: account.lifetimePoints,
      multiplier: tier.multiplier,
      nextTier: account.tier === 'PLATINUM' ? null : {
        name: account.tier === 'SILVER' ? 'GOLD' : 'PLATINUM',
        pointsNeeded: account.tier === 'SILVER'
          ? TIERS.GOLD.min - account.lifetimePoints
          : TIERS.PLATINUM.min - account.lifetimePoints,
      },
    };
  }),

  // ── Transaction history ─────────────────────────────────
  myTransactions: protectedProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const account = await prisma.loyaltyAccount.findUnique({ where: { userId: ctx.user.id } });
      if (!account) return { items: [], total: 0, page: 1, limit: input.limit };

      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.loyaltyTransaction.findMany({
          where: { accountId: account.id },
          orderBy: { createdAt: 'desc' },
          skip, take: input.limit,
        }),
        prisma.loyaltyTransaction.count({ where: { accountId: account.id } }),
      ]);

      return { items, total, page: input.page, limit: input.limit };
    }),

  // ── Available rewards ───────────────────────────────────
  rewards: protectedProcedure.query(async ({ ctx }) => {
    const account = await prisma.loyaltyAccount.findUnique({ where: { userId: ctx.user.id } });
    const userTier = account?.tier || 'SILVER';

    const rewards = await prisma.loyaltyReward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: 'asc' },
    });

    return rewards.map((r) => {
      const tierLevels = ['SILVER', 'GOLD', 'PLATINUM'];
      const eligible = tierLevels.indexOf(userTier) >= tierLevels.indexOf(r.minTier);
      return { ...r, eligible, canAfford: account ? account.points >= r.pointsCost : false };
    });
  }),

  // ── Redeem a reward ─────────────────────────────────────
  redeem: protectedProcedure
    .input(z.object({ rewardId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const reward = await prisma.loyaltyReward.findUnique({ where: { id: input.rewardId } });
      if (!reward || !reward.isActive) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reward not found' });
      }

      const account = await prisma.loyaltyAccount.findUnique({ where: { userId: ctx.user.id } });
      if (!account || account.points < reward.pointsCost) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Not enough points' });
      }

      const tierLevels = ['SILVER', 'GOLD', 'PLATINUM'];
      if (tierLevels.indexOf(account.tier) < tierLevels.indexOf(reward.minTier)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Requires ${reward.minTier} tier or higher` });
      }

      // Deduct points and create transaction
      await prisma.$transaction([
        prisma.loyaltyAccount.update({
          where: { id: account.id },
          data: { points: { decrement: reward.pointsCost } },
        }),
        prisma.loyaltyTransaction.create({
          data: {
            accountId: account.id,
            points: -reward.pointsCost,
            reason: 'redemption',
            referenceId: `reward:${reward.id}`,
          },
        }),
      ]);

      return {
        success: true,
        reward: { id: reward.id, type: reward.rewardType, value: Number(reward.rewardValue) },
        remainingPoints: account.points - reward.pointsCost,
      };
    }),

  // ── Admin: credit/debit points ──────────────────────────
  adjustPoints: adminProcedure
    .input(z.object({
      userId: z.number().int().positive(),
      points: z.number().int(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const account = await getOrCreateAccount(input.userId);

      await prisma.$transaction([
        prisma.loyaltyAccount.update({
          where: { id: account.id },
          data: {
            points: { increment: input.points },
            lifetimePoints: input.points > 0
              ? { increment: input.points }
              : undefined,
            tier: input.points > 0
              ? getTier(account.lifetimePoints + input.points)
              : account.tier,
          },
        }),
        prisma.loyaltyTransaction.create({
          data: {
            accountId: account.id,
            points: input.points,
            reason: input.reason,
          },
        }),
      ]);

      return { success: true };
    }),

  // ── Admin: manage rewards ────────────────────────────────
  listRewards: adminProcedure.query(async () => {
    return prisma.loyaltyReward.findMany({ orderBy: { pointsCost: 'asc' } });
  }),

  createReward: adminProcedure
    .input(z.object({
      nameAr: z.string(), nameEn: z.string(),
      descriptionAr: z.string().optional(), descriptionEn: z.string().optional(),
      pointsCost: z.number().int().positive(),
      rewardType: z.enum(['discount_percent', 'discount_fixed', 'free_service']),
      rewardValue: z.number().positive(),
      minTier: z.enum(['SILVER', 'GOLD', 'PLATINUM']).default('SILVER'),
    }))
    .mutation(async ({ input }) => {
      return prisma.loyaltyReward.create({
        data: {
          nameJson: { ar: input.nameAr, en: input.nameEn },
          descriptionJson: { ar: input.descriptionAr || '', en: input.descriptionEn || '' },
          pointsCost: input.pointsCost,
          rewardType: input.rewardType,
          rewardValue: input.rewardValue,
          minTier: input.minTier,
        },
      });
    }),
});

// ── Helper: accrue points after booking completion ─────────

export async function accrueBookingPoints(bookingId: number, userId: number, amountSar: number): Promise<void> {
  try {
    const account = await getOrCreateAccount(userId);
    const tier = TIERS[account.tier as keyof typeof TIERS] || TIERS.SILVER;
    const points = Math.round(amountSar * POINTS_PER_SAR * tier.multiplier);
    const newLifetime = account.lifetimePoints + points;
    const newTier = getTier(newLifetime);

    await prisma.$transaction([
      prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          points: { increment: points },
          lifetimePoints: newLifetime,
          tier: newTier,
        },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          points,
          reason: 'booking',
          referenceId: String(bookingId),
        },
      }),
    ]);

    // Tier upgrade notification (log for now)
    if (newTier !== account.tier) {
      // eslint-disable-next-line no-console
      console.log(`[Loyalty] User ${userId} tier upgrade: ${account.tier} → ${newTier}`);
    }
  } catch (err) {
    // Non-critical — log and continue
    // eslint-disable-next-line no-console
    console.error('[Loyalty] Failed to accrue points:', err);
  }
}
