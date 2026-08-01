import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const cycleTrackerRouter = router({
  myEntries: customerProcedure.query(async ({ ctx }) => {
    return prisma.cycleEntry.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' }, take: 90 });
  }),
  logDay: customerProcedure
    .input(z.object({ dayNumber: z.number().min(1).max(28), phase: z.string(), mood: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.cycleEntry.create({ data: { userId: ctx.user.id, ...input } });
    }),
  deleteEntry: customerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.cycleEntry.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
      return { success: true };
    }),
});
