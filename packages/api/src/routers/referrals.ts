import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';

function generateReferralCode(userId: number, name: string): string {
  // Create a readable code from user's name + a short hash
  const sanitized = name
    .replace(/[^a-zA-Z0-9؀-ۿ]/g, '')
    .slice(0, 4)
    .toUpperCase();
  const suffix = userId.toString(36).toUpperCase().padStart(3, '0');
  return `GOB-${sanitized}${suffix}`;
}

export const referralRouter = router({
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    // Check if user already has a referral
    const existingReferral = await prisma.referral.findFirst({
      where: { referrerId: ctx.user.id },
      select: { referralCode: true },
    });

    if (existingReferral) {
      return { code: existingReferral.referralCode };
    }

    // Generate a new code
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { name: true },
    });
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const code = generateReferralCode(ctx.user.id, user.name);

    // Create a placeholder referral entry to reserve the code
    // (full referral is created when someone uses the code)
    return { code };
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [referralsMade, creditsReceived] = await Promise.all([
      prisma.referral.findMany({
        where: { referrerId: ctx.user.id },
        include: {
          referred: {
            select: { id: true, name: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.walletTransaction.findMany({
        where: {
          wallet: { userId: ctx.user.id },
          source: 'REFERRAL_BONUS',
        },
      }),
    ]);

    const completedReferrals = referralsMade.filter(
      (r) => r.status === 'COMPLETED',
    );
    const totalEarned = creditsReceived.reduce(
      (sum, t) => sum + t.amount.toNumber(),
      0,
    );
    const pendingRewards = referralsMade
      .filter((r) => r.status === 'PENDING' && !r.rewardCredited)
      .reduce((sum, r) => sum + r.referrerReward.toNumber(), 0);

    return {
      totalReferred: referralsMade.length,
      completedReferrals: completedReferrals.length,
      pendingReferrals:
        referralsMade.length - completedReferrals.length,
      totalEarned,
      pendingRewards,
      referrals: referralsMade.map((r) => ({
        id: r.id,
        status: r.status,
        referralCode: r.referralCode,
        rewardCredited: r.rewardCredited,
        referrerReward: r.referrerReward.toNumber(),
        referred: r.referred,
        completedAt: r.completedAt,
        createdAt: r.createdAt,
      })),
    };
  }),

  applyCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const code = input.code.trim().toUpperCase();

      // Can't use own referral code
      const ownReferral = await prisma.referral.findFirst({
        where: { referrerId: ctx.user.id, referralCode: code },
      });
      if (ownReferral) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot use your own referral code',
        });
      }

      // Check if user was already referred
      const alreadyReferred = await prisma.referral.findFirst({
        where: { referredId: ctx.user.id },
      });
      if (alreadyReferred) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You have already used a referral code',
        });
      }

      // Find the referrer by code
      const referrerEntry = await prisma.referral.findFirst({
        where: { referralCode: code },
        select: { referrerId: true },
      });

      if (!referrerEntry) {
        // Check if code matches a potential generated code format
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid referral code',
        });
      }

      // Can't refer yourself
      if (referrerEntry.referrerId === ctx.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot refer yourself',
        });
      }

      // Check if the user being referred exists
      const referredUser = await prisma.user.findUnique({
        where: { id: ctx.user.id },
      });
      if (!referredUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Check that the referrer exists
      const referrer = await prisma.user.findUnique({
        where: { id: referrerEntry.referrerId },
      });
      if (!referrer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Referrer not found',
        });
      }

      // Create the referral
      const referral = await prisma.referral.create({
        data: {
          referrerId: referrerEntry.referrerId,
          referredId: ctx.user.id,
          referralCode: code,
          status: 'PENDING',
        },
      });

      return {
        id: referral.id,
        status: referral.status,
        message: 'Referral code applied successfully!',
        referrerBonus: referral.referrerReward.toNumber(),
        referredBonus: referral.referredReward.toNumber(),
      };
    }),

  // ── Leaderboard ───────────────────────────────────────
  leaderboard: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const topReferrers = await prisma.referral.groupBy({
        by: ['referrerId'],
        where: { status: 'COMPLETED' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: input.limit,
      });
      return topReferrers;
    }),

  // ── Share card ────────────────────────────────────────
  shareCard: protectedProcedure.query(async ({ ctx }) => {
    const ref = await prisma.referral.findFirst({ where: { referrerId: ctx.user.id }, select: { referralCode: true } });
    const code = ref?.referralCode || `GOB-${ctx.user.id}`;
    return {
      code,
      shareUrl: `${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/register?ref=${code}`,
      shareText: 'انضمي إلى جالكسي بيوتي واحصلي على خصم ٢٠ ريال!',
    };
  }),
});
