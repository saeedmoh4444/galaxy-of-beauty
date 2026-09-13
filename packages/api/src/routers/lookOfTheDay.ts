import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

const db = prisma;

export const lookOfTheDayRouter = router({
  today: publicProcedure.query(async () => {
    return db.communityLook.findFirst({ where: { isPublished: true }, orderBy: { votes: 'desc' } });
  }),

  feed: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(12) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        db.communityLook.findMany({
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: input.limit,
        }),
        db.communityLook.count({ where: { isPublished: true } }),
      ]);
      return { items, total };
    }),

  vote: customerProcedure.input(z.object({ lookId: z.number() })).mutation(async ({ input }) => {
    const look = await db.communityLook.update({
      where: { id: input.lookId },
      data: { votes: { increment: 1 } },
    });
    return { lookId: input.lookId, votes: look.votes, voted: true };
  }),

  submit: customerProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        title: z.string().min(1),
        technicianName: z.string(),
        category: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return db.communityLook.create({
        data: {
          userName: ctx.user.email,
          imageUrl: input.imageUrl,
          title: input.title,
          technicianName: input.technicianName,
          category: input.category,
        },
      });
    }),
});
