import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { protectedProcedure, customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const communityRouter = router({
  feed: protectedProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const posts = await db.communityPost.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });
      const total = await db.communityPost.count();
      // Enrich posts with user info
      const enriched = await Promise.all(
        posts.map(async (p: Record<string, unknown>) => {
          const user = await db.user.findUnique({ where: { id: p.userId } });
          return {
            ...p,
            userName: user?.name ?? 'مستخدم',
            userAvatar: user?.avatar ?? null,
          };
        }),
      );
      return { posts: enriched, total, hasMore: input.page * input.limit < total };
    }),
  myLikes: protectedProcedure.query(async ({ ctx }) => {
    const likes = await db.communityLike.findMany({ where: { userId: ctx.user.id } });
    return new Set((likes as Array<{ postId: number }>).map((l) => l.postId));
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
        return { liked: false };
      } else {
        await db.communityLike.create({ data: { postId: input.postId, userId: ctx.user.id } });
        await db.communityPost.update({ where: { id: input.postId }, data: { likes: { increment: 1 } } });
        return { liked: true };
      }
    }),
  delete: customerProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const post = await db.communityPost.findUnique({ where: { id: input.postId } });
      if (!post || post.userId !== ctx.user.id) throw new Error('Not authorized');
      await db.communityLike.deleteMany({ where: { postId: input.postId } });
      await db.communityPost.delete({ where: { id: input.postId } });
      return { success: true };
    }),
});
