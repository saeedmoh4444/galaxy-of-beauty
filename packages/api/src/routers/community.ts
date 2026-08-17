import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE, MS_PER_WEEK } from '@galaxy/shared';
import { protectedProcedure, customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- CommunityPost/Comment have no relations in Prisma schema (legacy include)
const db = prisma as any;

export const communityRouter = router({
  // Feed with user info and comments count
  feed: protectedProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [posts, total] = await Promise.all([
        db.communityPost.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: input.limit,
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            _count: { select: { comments: true } },
          },
        }),
        db.communityPost.count(),
      ]);
      return { items: posts, total, page: input.page };
    }),

  // Create post
  create: customerProcedure
    .input(
      z.object({
        content: z.string().min(1).max(1000),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return db.communityPost.create({
        data: { userId: ctx.user.id, ...input },
        include: { user: { select: { name: true, avatarUrl: true } } },
      });
    }),

  // Toggle like
  toggleLike: customerProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.communityLike.findUnique({
        where: { postId_userId: { postId: input.postId, userId: ctx.user.id } },
      });
      if (existing) {
        await db.communityLike.delete({ where: { id: existing.id } });
        await db.communityPost.update({
          where: { id: input.postId },
          data: { likes: { decrement: 1 } },
        });
        return { liked: false };
      }
      await db.communityLike.create({ data: { postId: input.postId, userId: ctx.user.id } });
      await db.communityPost.update({
        where: { id: input.postId },
        data: { likes: { increment: 1 } },
      });
      return { liked: true };
    }),

  // My likes
  myLikes: protectedProcedure.query(async ({ ctx }) => {
    return db.communityLike.findMany({ where: { userId: ctx.user.id }, select: { postId: true } });
  }),

  // Comments
  comments: protectedProcedure
    .input(
      z.object({ postId: z.number(), page: z.number().default(1), limit: z.number().default(20) }),
    )
    .query(async ({ input }) => {
      return db.communityComment.findMany({
        where: { postId: input.postId },
        orderBy: { createdAt: 'asc' },
        take: input.limit,
        include: { user: { select: { name: true, avatarUrl: true } } },
      });
    }),

  addComment: customerProcedure
    .input(z.object({ postId: z.number(), content: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      return db.communityComment.create({
        data: { postId: input.postId, userId: ctx.user.id, content: input.content },
        include: { user: { select: { name: true, avatarUrl: true } } },
      });
    }),

  // Delete post
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.communityPost.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),

  // Trending posts (most liked this week)
  trending: protectedProcedure.query(async () => {
    const weekAgo = new Date(Date.now() - MS_PER_WEEK);
    return db.communityPost.findMany({
      where: { createdAt: { gte: weekAgo } },
      orderBy: { likes: 'desc' },
      take: SMALL_PAGE_SIZE,
      include: { user: { select: { name: true } } },
    });
  }),
});
