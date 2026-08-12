import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const sleepTrackerRouter = router({
  myLogs: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(31).default(7) }))
    .query(async ({ ctx, input }) => {
      return prisma.sleepLog.findMany({
        where: { userId: ctx.user.id },
        orderBy: { date: 'desc' },
        take: input.limit,
      });
    }),

  log: customerProcedure
    .input(
      z.object({
        hours: z.number().min(0).max(24),
        quality: z.number().int().min(1).max(5).optional(),
        bedtime: z.string().optional(),
        wakeTime: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().slice(0, 10);
      return prisma.sleepLog.upsert({
        where: { userId_date: { userId: ctx.user.id, date: today } },
        create: {
          userId: ctx.user.id,
          date: today,
          hours: input.hours,
          quality: input.quality ?? null,
          bedtime: input.bedtime ?? null,
          wakeTime: input.wakeTime ?? null,
        },
        update: { hours: input.hours, quality: input.quality ?? null },
      });
    }),

  stats: customerProcedure.query(async ({ ctx }) => {
    const logs = await prisma.sleepLog.findMany({
      where: { userId: ctx.user.id },
      orderBy: { date: 'desc' },
      take: 30,
    });
    const avg =
      logs.length > 0
        ? Math.round((logs.reduce((s, l) => s + l.hours, 0) / logs.length) * 10) / 10
        : 0;
    const avgQuality =
      logs.length > 0
        ? Math.round((logs.reduce((s, l) => s + (l.quality ?? 0), 0) / logs.length) * 10) / 10
        : 0;
    return { avgHours: avg, avgQuality, totalLogs: logs.length };
  }),
});
