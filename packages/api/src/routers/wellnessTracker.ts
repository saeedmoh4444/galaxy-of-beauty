import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const wellnessTrackerRouter = router({
  today: customerProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().slice(0, 10);
    return prisma.wellnessCheckin.findUnique({
      where: { userId_date: { userId: ctx.user.id, date: today } },
    });
  }),

  checkin: customerProcedure
    .input(
      z.object({
        water: z.number().optional(),
        sleep: z.number().optional(),
        mood: z.number().optional(),
        steps: z.number().optional(),
        skincare: z.boolean().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().slice(0, 10);
      return prisma.wellnessCheckin.upsert({
        where: { userId_date: { userId: ctx.user.id, date: today } },
        create: { userId: ctx.user.id, date: today, ...input },
        update: input,
      });
    }),

  weekly: customerProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const week: Array<{
      date: string;
      water: number;
      sleep: number;
      mood: number;
      steps: number;
      skincare: boolean;
    }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entry = await prisma.wellnessCheckin.findUnique({
        where: { userId_date: { userId: ctx.user.id, date: dateStr } },
      });
      week.push(entry ?? { date: dateStr, water: 0, sleep: 0, mood: 0, steps: 0, skincare: false });
    }
    const avgWater = Math.round(week.reduce((s, d) => s + d.water, 0) / 7);
    const avgSleep = Math.round((week.reduce((s, d) => s + d.sleep, 0) / 7) * 10) / 10;
    const avgMood =
      Math.round(
        (week.reduce((s, d) => s + (d.mood || 0), 0) / week.filter((d) => d.mood > 0).length || 1) *
          10,
      ) / 10;
    const totalSteps = week.reduce((s, d) => s + d.steps, 0);
    const skincareDays = week.filter((d) => d.skincare).length;
    return { week, avgWater, avgSleep, avgMood, totalSteps, skincareDays, streak: skincareDays };
  }),
});
