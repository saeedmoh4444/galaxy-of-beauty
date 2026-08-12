import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

const ACHIEVEMENTS = [
  { key: 'first_booking', emoji: '', title: 'أول حجز', description: 'أكملتِ أول حجز لكِ' },
  { key: 'five_bookings', emoji: '', title: '5 حجوزات', description: 'أكملتِ 5 حجوزات' },
  { key: 'ten_bookings', emoji: '', title: '10 حجوزات', description: 'أكملتِ 10 حجوزات' },
  { key: 'first_review', emoji: '', title: 'أول تقييم', description: 'كتبتِ أول تقييم' },
  {
    key: 'streak_7',
    emoji: '',
    title: '7 أيام متتالية',
    description: 'حافظتِ على روتينك 7 أيام',
  },
  { key: 'referral_3', emoji: '', title: '3 دعوات', description: 'دعوتِ 3 صديقات' },
];

export const beautyAchievementsRouter = router({
  list: publicProcedure.query(() => ACHIEVEMENTS),

  myAchievements: customerProcedure.query(async ({ ctx }) => {
    const earned = await prisma.customerAchievement.findMany({
      where: { userId: ctx.user.id },
      select: { achievementKey: true, earnedAt: true },
    });
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      earned: earned.some((e) => e.achievementKey === a.key),
      earnedAt: earned.find((e) => e.achievementKey === a.key)?.earnedAt ?? null,
    }));
  }),

  checkAndAward: customerProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.customerAchievement.findUnique({
        where: { userId_achievementKey: { userId: ctx.user.id, achievementKey: input.key } },
      });
      if (!existing && ACHIEVEMENTS.some((a) => a.key === input.key)) {
        await prisma.customerAchievement.create({
          data: { userId: ctx.user.id, achievementKey: input.key },
        });
        return { awarded: true };
      }
      return { awarded: false };
    }),

  stats: customerProcedure.query(async ({ ctx }) => {
    const earned = await prisma.customerAchievement.count({ where: { userId: ctx.user.id } });
    return {
      earned,
      total: ACHIEVEMENTS.length,
      pct: Math.round((earned / ACHIEVEMENTS.length) * 100),
    };
  }),
});
