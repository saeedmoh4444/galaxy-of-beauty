import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const beautyRemindersRouter = router({
  myReminders: customerProcedure.query(({ ctx }) =>
    db.beautyReminder.findMany({ where: { userId: ctx.user.id }, orderBy: { nextDate: 'asc' } }),
  ),

  create: customerProcedure
    .input(
      z.object({
        title: z.string(),
        category: z.enum(['hair', 'nails', 'skincare', 'makeup', 'body', 'other']),
        intervalDays: z.number().min(1).max(365),
        nextDate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const next = input.nextDate
        ? new Date(input.nextDate)
        : new Date(Date.now() + input.intervalDays * 86400000);
      return db.beautyReminder.create({
        data: {
          userId: ctx.user.id,
          title: input.title,
          category: input.category,
          intervalDays: input.intervalDays,
          nextDate: next,
        },
      });
    }),

  complete: customerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const reminder = await db.beautyReminder.findUnique({ where: { id: input.id } });
      if (!reminder || reminder.userId !== ctx.user.id) throw new Error('غير موجود');
      const nextDate = new Date(Date.now() + reminder.intervalDays * 86400000);
      return db.beautyReminder.update({
        where: { id: input.id },
        data: { lastCompletedAt: new Date(), nextDate },
      });
    }),

  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.beautyReminder.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),
});
