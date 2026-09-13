import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const db = prisma;

export const beautyJournalRouter = router({
  list: customerProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) =>
      db.beautyJournal.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
    ),
  create: customerProcedure
    .input(
      z.object({
        title: z.string().optional(),
        content: z.string().min(1).max(1000),
        mood: z.number().min(1).max(5).optional(),
        imageUrl: z.string().optional(),
        serviceType: z.enum(['hair', 'skin', 'makeup', 'nails', 'body']).optional(),
        bookingId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      db.beautyJournal.create({ data: { userId: ctx.user.id, ...input } }),
    ),
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.beautyJournal.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),
});
