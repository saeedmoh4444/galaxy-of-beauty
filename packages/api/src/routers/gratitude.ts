import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

export const gratitudeRouter = router({
  myNotes: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(10) }))
    .query(async ({ ctx, input }) => {
      return prisma.gratitudeNote.findMany({
        where: { authorId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });
    }),

  send: customerProcedure
    .input(
      z.object({
        message: z.string().min(5).max(300),
        toName: z.string().min(1).max(100),
        emoji: z.string().default(''),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.gratitudeNote.create({
        data: {
          authorId: ctx.user.id,
          authorName: ctx.user.name ?? '',
          toName: input.toName,
          message: input.message,
          emoji: input.emoji,
        },
      });
    }),

  publicFeed: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(10) }))
    .query(async ({ input }) => {
      return prisma.gratitudeNote.findMany({ orderBy: { createdAt: 'desc' }, take: input.limit });
    }),

  count: publicProcedure.query(async () => {
    return prisma.gratitudeNote.count();
  }),
});
