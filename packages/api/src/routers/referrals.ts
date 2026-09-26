import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';
import {
  MONTHLY_PRIZE_AMOUNTS,
  REFERRED_REWARD,
  tieredReferrerReward,
  monthKey,
  monthRange,
  previousMonthKey,
} from '../lib/referralRewards';

/** "YYYY-MM" with a real month number (1..12). */
const monthInput = z
  .string()
  .regex(/^\d{4}-\d{2}$/)
  .refine((m) => {
    const [y, mo] = m.split('-').map((p) => Number(p));
    const jan = new Date(Date.UTC(y ?? 0, (mo ?? 1) - 1, 1));
    return jan.getUTCMonth() === (mo ?? 1) - 1;
  }, 'Invalid month')
  .optional();

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

    // The code is reserved — full referral record is created when someone redeems it
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

    const completedReferrals = referralsMade.filter((r) => r.status === 'COMPLETED');
    const totalEarned = creditsReceived.reduce((sum, t) => sum + t.amount.toNumber(), 0);
    const pendingRewards = referralsMade
      .filter((r) => r.status === 'PENDING' && !r.rewardCredited)
      .reduce((sum, r) => sum + r.referrerReward.toNumber(), 0);

    // 8.1b — per-source attribution breakdown.
    const attribution = new Map<
      string,
      { source: string | null; campaign: string | null; count: number }
    >();
    for (const r of referralsMade) {
      const key = `${r.utmSource ?? ''}\u0000${r.utmCampaign ?? ''}`;
      const entry = attribution.get(key) ?? {
        source: r.utmSource,
        campaign: r.utmCampaign,
        count: 0,
      };
      entry.count++;
      attribution.set(key, entry);
    }

    return {
      totalReferred: referralsMade.length,
      completedReferrals: completedReferrals.length,
      pendingReferrals: referralsMade.length - completedReferrals.length,
      totalEarned,
      pendingRewards,
      attribution: [...attribution.values()],
      referrals: referralsMade.map((r) => ({
        id: r.id,
        status: r.status,
        referralCode: r.referralCode,
        rewardCredited: r.rewardCredited,
        referrerReward: r.referrerReward.toNumber(),
        utmSource: r.utmSource,
        utmCampaign: r.utmCampaign,
        referred: r.referred,
        completedAt: r.completedAt,
        createdAt: r.createdAt,
      })),
    };
  }),

  applyCode: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        // 8.1b — attribution from the share link's UTM params.
        utm: z
          .object({
            source: z.string().max(100).optional(),
            medium: z.string().max(100).optional(),
            campaign: z.string().max(100).optional(),
            content: z.string().max(100).optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const code = input.code.trim().toUpperCase();

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

      // Resolve the referrer: prefer an existing referral row carrying the
      // code, otherwise decode the generated-code format
      // (GOB-<name[0-4]><base36(userId) padded to 3>) — codes are derived
      // from the referrer and only persisted on first redemption, so a
      // fresh code has no row yet.
      let referrerId: number | null = null;
      const existingRow = await prisma.referral.findFirst({
        where: { referralCode: code },
        select: { referrerId: true },
      });
      if (existingRow) {
        referrerId = existingRow.referrerId;
      } else {
        // Codes are derived from the referrer and only persisted on first
        // redemption. Accept the shareCard fallback (GOB-<decimal id>)
        // first, then the generated format GOB-<sanitizedName><base36(userId)
        // padded to 3> — names may contain Arabic, so take the last 3
        // chars as the base36 suffix.
        const fallback = /^GOB-(\d+)$/.exec(code);
        let candidate = fallback ? Number(fallback[1]) : NaN;
        if (!Number.isInteger(candidate) || candidate <= 0) {
          const suffix = code.startsWith('GOB-') && code.length > 3 ? code.slice(-3) : '';
          const suffixNum = /^[0-9A-Z]{3}$/.test(suffix) ? parseInt(suffix, 36) : NaN;
          candidate = suffixNum;
        }
        if (!Number.isInteger(candidate) || candidate <= 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invalid referral code',
          });
        }
        referrerId = candidate;
      }

      // Can't use own referral code
      if (referrerId === ctx.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot use your own referral code',
        });
      }

      // Check that the referrer exists
      const referrer = await prisma.user.findUnique({
        where: { id: referrerId },
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
          referrerId,
          referredId: ctx.user.id,
          referralCode: code,
          status: 'PENDING',
          ...(input.utm
            ? {
                utmSource: input.utm.source ?? null,
                utmMedium: input.utm.medium ?? null,
                utmCampaign: input.utm.campaign ?? null,
                utmContent: input.utm.content ?? null,
              }
            : {}),
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

  // ── Leaderboard (8.1a v2: enriched, optional month filter) ─────────
  leaderboard: publicProcedure
    .input(z.object({ limit: z.number().default(10), month: monthInput }))
    .query(async ({ input }) => {
      const window = input.month ? monthRange(input.month) : null;
      const leaders = await prisma.referral.groupBy({
        by: ['referrerId'],
        where: {
          status: 'COMPLETED',
          ...(window ? { completedAt: { gte: window.start, lt: window.end } } : {}),
        },
        _count: { id: true },
        orderBy: [{ _count: { id: 'desc' } }, { referrerId: 'asc' }],
        take: input.limit,
      });
      const users = await prisma.user.findMany({
        where: { id: { in: leaders.map((l) => l.referrerId) } },
        select: { id: true, name: true, avatarUrl: true },
      });
      const byId = new Map(users.map((u) => [u.id, u]));
      return leaders.map((l, i) => {
        const u = byId.get(l.referrerId);
        return {
          rank: i + 1,
          userId: l.referrerId,
          name: u?.name ?? 'مستخدمة',
          avatarUrl: u?.avatarUrl ?? null,
          count: l._count.id,
        };
      });
    }),

  // ── Monthly prizes (8.1a) ───────────────────────────────────────────
  monthlyPrizes: publicProcedure.input(z.object({ month: monthInput })).query(async ({ input }) => {
    const month = input.month ?? monthKey(new Date());
    const rows = await prisma.referralPrize.findMany({
      where: { month },
      include: { winner: { select: { name: true } } },
    });
    const byRank = new Map(rows.map((r) => [r.rank, r]));
    return {
      month,
      prizes: [1, 2, 3].map((rank) => {
        const row = byRank.get(rank);
        return {
          rank,
          amount: row ? row.amount.toNumber() : MONTHLY_PRIZE_AMOUNTS[rank - 1]!,
          winnerId: row?.winnerId ?? null,
          winnerName: row?.winner?.name ?? null,
          status: row?.status ?? 'PENDING',
          creditedAt: row?.creditedAt ?? null,
        };
      }),
    };
  }),

  // Award the top-3 referrers of a month (defaults to the previous
  // month). Idempotent: any existing rows for the month short-circuit.
  awardMonthlyPrizes: adminProcedure
    .input(z.object({ month: monthInput }))
    .mutation(async ({ input }) => {
      const month = input.month ?? previousMonthKey();
      const existing = await prisma.referralPrize.findMany({
        where: { month },
        orderBy: { rank: 'asc' },
      });
      if (existing.length > 0) {
        return existing.map((p) => ({ ...p, amount: p.amount.toNumber() }));
      }

      const window = monthRange(month);
      const top = await prisma.referral.groupBy({
        by: ['referrerId'],
        where: { status: 'COMPLETED', completedAt: { gte: window.start, lt: window.end } },
        _count: { id: true },
        orderBy: [{ _count: { id: 'desc' } }, { referrerId: 'asc' }],
        take: 3,
      });
      if (top.length === 0) return [];

      const prizes = [];
      for (let i = 0; i < top.length; i++) {
        const amount = MONTHLY_PRIZE_AMOUNTS[i]!;
        const prize = await prisma.referralPrize.create({
          data: {
            month,
            rank: i + 1,
            amount,
            winnerId: top[i]!.referrerId,
            status: 'CREDITED',
            creditedAt: new Date(),
          },
        });
        const wallet = await prisma.wallet.findUnique({
          where: { userId: top[i]!.referrerId },
        });
        if (wallet) {
          await prisma.wallet.update({
            where: { userId: top[i]!.referrerId },
            data: { bonusBalance: { increment: amount } },
          });
          await prisma.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'CREDIT',
              source: 'REFERRAL_BONUS',
              amount,
              description: `جائزة إحالات شهر ${month} — المركز ${i + 1}`,
              referenceId: `prize_${prize.id}`,
            },
          });
        }
        prizes.push(prize);
      }
      return prizes.map((p) => ({ ...p, amount: p.amount.toNumber() }));
    }),

  // ── Share card ────────────────────────────────────────
  shareCard: protectedProcedure.query(async ({ ctx }) => {
    const ref = await prisma.referral.findFirst({
      where: { referrerId: ctx.user.id },
      select: { referralCode: true },
    });
    const code = ref?.referralCode || `GOB-${ctx.user.id}`;
    const base = `${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/register`;
    return {
      code,
      // 8.1b — UTM-tagged so redemptions carry their channel back.
      shareUrl: `${base}?ref=${encodeURIComponent(code)}&utm_source=referral&utm_medium=share&utm_campaign=${encodeURIComponent(code)}`,
      shareText: 'انضمي إلى جالكسي بيوتي واحصلي على خصم ٢٠ ريال!',
    };
  }),

  // Enhanced stats with tiered rewards
  getEnhancedStats: protectedProcedure.query(async ({ ctx }) => {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const completed = referrals.filter((r) => r.rewardCredited);
    const totalEarnings = completed.reduce((sum, r) => sum + Number(r.referrerReward), 0);
    const referralCode = referrals[0]?.referralCode ?? '——';

    // Tiered rewards
    const count = completed.length;
    const tier = count >= 10 ? 'الماسي' : count >= 5 ? 'ذهبي' : count >= 1 ? 'فضي' : 'مبتدئ';
    const nextTier =
      count >= 10
        ? null
        : count >= 5
          ? 'الماسي (١٠ إحالات)'
          : count >= 1
            ? 'ذهبي (٥ إحالات)'
            : 'فضي (إحالة واحدة)';
    const nextCount = count >= 10 ? 0 : count >= 5 ? 10 - count : count >= 1 ? 5 - count : 1;

    // Double-sided rewards — aligned with lib/referralRewards (the same
    // schedule the booking completion path credits).
    const referrerBonus = tieredReferrerReward(count + 1);
    const referredBonus = REFERRED_REWARD; // New user always gets 20 SAR

    return {
      referralCode,
      totalReferrals: referrals.length,
      completedReferrals: count,
      totalEarnings,
      tier,
      nextTier,
      nextCount,
      referrerBonus,
      referredBonus,
      recentReferrals: referrals.slice(0, 5).map((r) => ({
        referredId: r.referredId,
        date: r.createdAt,
        rewarded: r.rewardCredited,
        referrerReward: Number(r.referrerReward),
        referredReward: Number(r.referredReward),
      })),
    };
  }),
});
