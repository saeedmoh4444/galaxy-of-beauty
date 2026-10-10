import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

const db = prisma;

const CHALLENGES = [
  { id: '7day_skincare', title: 'تحدي 7 أيام عناية', emoji: '🧴', points: 100, days: 7 },
  { id: 'water_challenge', title: 'تحدي شرب الماء', emoji: '💧', points: 50, days: 5 },
  { id: 'no_makeup_weekend', title: 'عطلة بدون مكياج', emoji: '🚫', points: 75, days: 2 },
  { id: 'review_blitz', title: 'كتابة 3 تقييمات', emoji: '⭐', points: 150, days: 7 },
  { id: 'referral_race', title: 'سباق الإحالات', emoji: '🏁', points: 300, days: 30 },
];

export const beautyGamificationRouter = router({
  challenges: publicProcedure.query(() => CHALLENGES),

  // Audit #14 — real leaderboard: top loyalty accounts by points, names joined.
  leaderboard: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ input }) => {
      const accounts = await db.loyaltyAccount.findMany({
        orderBy: { points: 'desc' },
        take: input.limit,
        select: { userId: true, points: true, tier: true },
      });
      const users = await db.user.findMany({
        where: { id: { in: accounts.map((a) => a.userId) } },
        select: { id: true, name: true },
      });
      const byId = new Map(users.map((u) => [u.id, u.name]));
      return {
        items: accounts.map((a) => ({
          userId: a.userId,
          userName: byId.get(a.userId) ?? 'مستخدمة',
          points: a.points,
          tier: a.tier,
        })),
      };
    }),

  myPoints: customerProcedure.query(async ({ ctx }) => {
    const account = await db.loyaltyAccount.findUnique({ where: { userId: ctx.user.id } });
    return {
      points: account?.points ?? 0,
      tier: account?.tier ?? 'SILVER',
      challenges: CHALLENGES,
    };
  }),
});
