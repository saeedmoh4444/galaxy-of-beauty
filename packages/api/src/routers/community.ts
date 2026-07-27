import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { protectedProcedure, customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const communityRouter = router({
  feed: protectedProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const posts = await db.communityPost.findMany({ orderBy: { createdAt: 'desc' }, skip: (input.page - 1) * input.limit, take: input.limit });
      return posts;
    }),
  create: customerProcedure
    .input(z.object({ content: z.string().min(1).max(500), imageUrl: z.string().optional() }))
    .mutation(async ({ ctx, input }) => db.communityPost.create({ data: { userId: ctx.user.id, ...input } })),
  toggleLike: customerProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.communityLike.findUnique({ where: { postId_userId: { postId: input.postId, userId: ctx.user.id } } });
      if (existing) {
        await db.communityLike.delete({ where: { id: existing.id } });
        await db.communityPost.update({ where: { id: input.postId }, data: { likes: { decrement: 1 } } });
      } else {
        await db.communityLike.create({ data: { postId: input.postId, userId: ctx.user.id } });
        await db.communityPost.update({ where: { id: input.postId }, data: { likes: { increment: 1 } } });
      }
      return { success: true };
    }),
});
