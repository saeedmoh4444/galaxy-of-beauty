import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE, MS_PER_WEEK } from '@galaxy/shared';
import { protectedProcedure, customerProcedure, publicProcedure, router } from '../trpc';

const db = prisma;

const userSelect = { id: true, name: true, avatarUrl: true } as const;

/** CommunityPost/Comment carry a userId scalar without a schema relation —
 * hydrate the user records manually (legacy include returned nothing). */
async function hydrateUsers<T extends { userId: number }>(
  rows: T[],
  select: typeof userSelect = userSelect,
): Promise<(T & { user: Record<string, unknown> | null })[]> {
  const users = await db.user.findMany({
    where: { id: { in: [...new Set(rows.map((r) => r.userId))] } },
    select,
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  return rows.map((r) => ({ ...r, user: byId.get(r.userId) ?? null }));
}

export const communityRouter = router({
  // Feed with user info and comments count
  // Public feed — the community wall is browsable without an account
  // (public /community screens on web + mobile).
  feed: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [posts, total] = await Promise.all([
        db.communityPost.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: input.limit,
        }),
        db.communityPost.count(),
      ]);
      const commentCounts = await db.communityComment.groupBy({
        by: ['postId'],
        where: { postId: { in: posts.map((p) => p.id) } },
        _count: { postId: true },
      });
      const countsById = new Map(commentCounts.map((c) => [c.postId, c._count.postId]));
      const hydrated = await hydrateUsers(posts);
      return {
        items: hydrated.map((p) => ({ ...p, _count: { comments: countsById.get(p.id) ?? 0 } })),
        total,
        page: input.page,
      };
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
      const post = await db.communityPost.create({
        data: { userId: ctx.user.id, ...input },
      });
      const [hydrated] = await hydrateUsers([post]);
      return hydrated;
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

  // Post ids the caller has liked
  myLikes: protectedProcedure.query(async ({ ctx }) => {
    return db.communityLike.findMany({ where: { userId: ctx.user.id }, select: { postId: true } });
  }),

  // Comments on a post
  comments: publicProcedure
    .input(
      z.object({ postId: z.number(), page: z.number().default(1), limit: z.number().default(20) }),
    )
    .query(async ({ input }) => {
      const rows = await db.communityComment.findMany({
        where: { postId: input.postId },
        orderBy: { createdAt: 'asc' },
        take: input.limit,
      });
      return hydrateUsers(rows);
    }),

  addComment: customerProcedure
    .input(z.object({ postId: z.number(), content: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const comment = await db.communityComment.create({
        data: { postId: input.postId, userId: ctx.user.id, content: input.content },
      });
      const [hydrated] = await hydrateUsers([comment]);
      return hydrated;
    }),

  // Delete post
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.communityPost.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),

  // Trending posts (most liked this week)
  trending: protectedProcedure.query(async () => {
    const weekAgo = new Date(Date.now() - MS_PER_WEEK);
    const posts = await db.communityPost.findMany({
      where: { createdAt: { gte: weekAgo } },
      orderBy: { likes: 'desc' },
      take: SMALL_PAGE_SIZE,
    });
    return hydrateUsers(posts, { id: true, name: true, avatarUrl: true });
  }),
});
