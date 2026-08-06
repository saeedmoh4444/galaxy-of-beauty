import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const CHALLENGES = [
  { id: '7day_skincare', title: 'تحدي 7 أيام عناية', emoji: '🧴', points: 100, days: 7 },
  { id: 'water_challenge', title: 'تحدي شرب الماء', emoji: '💧', points: 50, days: 5 },
  { id: 'no_makeup_weekend', title: 'عطلة بدون مكياج', emoji: '🌿', points: 75, days: 2 },
  { id: 'review_blitz', title: 'كتابة 3 تقييمات', emoji: '⭐', points: 150, days: 7 },
  { id: 'referral_race', title: 'سباق الإحالات', emoji: '👯', points: 300, days: 30 },
];

export const beautyGamificationRouter = router({
  challenges: publicProcedure.query(() => CHALLENGES),

  leaderboard: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async () => ({ items: [], message: 'Gamification leaderboard — coming soon' })),

  myPoints: customerProcedure.query(async () => ({ points: 0, challenges: [] })),
});
