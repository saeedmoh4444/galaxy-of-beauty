import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { BULK_PAGE_SIZE, DEFAULT_PAGE_SIZE, DEFAULT_APP_URL, MS_PER_DAY } from '@galaxy/shared';
import { adminProcedure, customerProcedure, publicProcedure, router } from '../trpc';

const db = prisma;

const CAMPAIGN_DURATION_DAYS = 14;
const PRIZES = ['جلسة مجانية', 'خصم ٥٠٪', 'خصم ٣٠٪'];
// Audit #4 — the prizes are real money now: bonusBalance credits (SAR) for
// ranks 1-3, mirroring the display prizes (free session / 50% / 30%).
const RACE_PRIZE_BONUS = [100, 50, 30];

/** Returns the fixed campaign end date. Uses REFERRAL_CAMPAIGN_START env var
 *  (ISO date string) to anchor the campaign, defaulting to the first time this
 *  module was loaded (stable within a deployment, resets on redeploy). */
const getEndDate = (() => {
  const startRaw = process.env['REFERRAL_CAMPAIGN_START'];
  const start = startRaw ? new Date(startRaw) : new Date();
  const end = new Date(start.getTime() + CAMPAIGN_DURATION_DAYS * MS_PER_DAY);
  return () => end;
})();

export const referralRaceRouter = router({
  leaderboard: publicProcedure.query(async () => {
    const endDate = getEndDate();
    const leaders = await db.referral.groupBy({
      by: ['referrerId'],
      where: { status: 'COMPLETED' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: DEFAULT_PAGE_SIZE,
    });
    const enriched = await Promise.all(
      leaders.map(async (l, i) => {
        const user = await db.user.findUnique({
          where: { id: l.referrerId },
          select: { name: true },
        });
        return {
          userId: l.referrerId,
          userName: user?.name || 'مستخدمة',
          referralCount: l._count.id,
          prize: PRIZES[i] || '',
          rank: i + 1,
        };
      }),
    );
    return {
      leaders: enriched,
      endDate: endDate.toISOString(),
      remainingDays: Math.ceil((endDate.getTime() - Date.now()) / MS_PER_DAY),
      prizes: PRIZES,
    };
  }),

  myRank: customerProcedure.query(async ({ ctx }) => {
    const count = await db.referral.count({
      where: { referrerId: ctx.user.id, status: 'COMPLETED' },
    });
    const leaders = await db.referral.groupBy({
      by: ['referrerId'],
      where: { status: 'COMPLETED' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: BULK_PAGE_SIZE,
    });
    const rank = leaders.findIndex((l) => l.referrerId === ctx.user.id) + 1;
    return { rank: rank || null, count, prize: rank > 0 && rank <= 3 ? PRIZES[rank - 1] : '' };
  }),

  share: customerProcedure
    .input(z.object({ platform: z.enum(['whatsapp', 'twitter', 'copy']) }))
    .mutation(async ({ ctx }) => {
      const code = await db.referral.findFirst({
        where: { referrerId: ctx.user.id },
        select: { referralCode: true },
      });
      const appUrl = process.env['NEXT_PUBLIC_APP_URL'] || DEFAULT_APP_URL;
      return {
        url: `${appUrl}/register?ref=${code?.referralCode || ctx.user.id}`,
        message: 'انضمي لجالكسي بيوتي واكسبي جوائز!',
      };
    }),

  /**
   * awardPrizes (admin) — pay the top-3 referrers of the campaign.
   * Credits bonusBalance (non-withdrawable) via REFERRAL_BONUS
   * transactions, idempotent per campaign per winner — safe to re-run.
   */
  awardPrizes: adminProcedure.mutation(async () => {
    const endDate = getEndDate();
    const campaignKey = endDate.toISOString().slice(0, 10);
    const leaders = await db.referral.groupBy({
      by: ['referrerId'],
      where: { status: 'COMPLETED' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 3,
    });

    const awarded: Array<{ userId: number; rank: number; amount: number }> = [];
    for (const [i, leader] of leaders.entries()) {
      const amount = RACE_PRIZE_BONUS[i] ?? 0;
      if (amount <= 0) continue;
      const idempotencyKey = `referral_race_${campaignKey}_${leader.referrerId}`;
      const existing = await db.walletTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) continue; // already awarded for this campaign

      const wallet = await db.wallet.findUnique({ where: { userId: leader.referrerId } });
      if (!wallet) continue; // no wallet — nothing to credit

      await db.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { bonusBalance: { increment: amount } },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'CREDIT',
            source: 'REFERRAL_BONUS',
            amount,
            description: `Referral race #${i + 1} prize`,
            idempotencyKey,
          },
        });
      });
      awarded.push({ userId: leader.referrerId, rank: i + 1, amount });
    }

    return { awarded, campaignKey };
  }),
});
