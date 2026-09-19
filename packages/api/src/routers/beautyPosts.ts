/**
 * 2.5 Social Commerce — shoppable beauty posts (BeautyPost).
 *
 * Instagram-style UGC feed: posts carry product/service tags (tap → cart /
 * booking deep links on the clients), a denormalized like counter (toggle
 * via unique join table — CommunityPost pattern), comments, view counting
 * (shorts precedent) and engagement event rows for the analytics story.
 * Anyone authed can post (instant publish); technician authors carry their
 * kycStatus so the UI renders the verified badge. Admins curate `featured`.
 */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import {
  publicProcedure,
  protectedProcedure,
  customerProcedure,
  adminProcedure,
  router,
} from '../trpc';
import type { JwtPayload } from '../lib/jwt';

type TagRefs = { products: number[]; services: number[] };

function parseTags(tagsJson: unknown): TagRefs {
  const t = (tagsJson ?? {}) as { products?: unknown; services?: unknown };
  return {
    products: Array.isArray(t.products) ? (t.products as number[]) : [],
    services: Array.isArray(t.services) ? (t.services as number[]) : [],
  };
}

/** Resolve authors + tag summaries for a page of posts. */
async function enrichPosts(
  posts: Array<{ id: number; userId: number; tagsJson: unknown } & Record<string, unknown>>,
  viewer: JwtPayload | null,
): Promise<Array<Record<string, unknown>>> {
  if (posts.length === 0) return [];

  const authorIds = [...new Set(posts.map((p) => p.userId))];
  const [authors, technicians, likedRows, allProductIds, allServiceIds] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true },
    }),
    prisma.technician.findMany({
      where: { userId: { in: authorIds } },
      select: { userId: true, kycStatus: true },
    }),
    viewer
      ? prisma.beautyPostLike.findMany({
          where: { postId: { in: posts.map((p) => p.id) }, userId: viewer.id },
          select: { postId: true },
        })
      : Promise.resolve([]),
    // Tag refs aggregated from tagsJson.
    Promise.resolve([...new Set(posts.flatMap((p) => parseTags(p.tagsJson).products))] as number[]),
    Promise.resolve([...new Set(posts.flatMap((p) => parseTags(p.tagsJson).services))] as number[]),
  ]);

  const kycByUser = new Map(technicians.map((t) => [t.userId, t.kycStatus]));
  const likedSet = new Set(likedRows.map((l) => l.postId));
  const [products, services] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: allProductIds } },
      select: { id: true, nameJson: true, brand: true, imageUrl: true, price: true },
    }),
    prisma.service.findMany({
      where: { id: { in: allServiceIds } },
      select: { id: true, titleJson: true, basePrice: true, durationMin: true },
    }),
  ]);
  const productById = new Map(products.map((p) => [p.id, p]));
  const serviceById = new Map(services.map((s) => [s.id, s]));

  return posts.map((p) => {
    const refs = parseTags(p.tagsJson);
    return {
      id: p.id,
      imageUrl: p.imageUrl,
      caption: p.caption,
      likes: p.likes,
      views: p.views,
      featured: p.featured,
      createdAt: p.createdAt,
      likedByMe: likedSet.has(p.id),
      author: {
        id: p.userId,
        name: authors.find((a) => a.id === p.userId)?.name ?? '—',
        kycStatus: kycByUser.get(p.userId) ?? null,
      },
      tags: {
        products: refs.products
          .map((id) => productById.get(id))
          .filter(Boolean)
          .map((prod) => ({
            id: prod!.id,
            nameJson: prod!.nameJson,
            brand: prod!.brand,
            imageUrl: prod!.imageUrl,
            price: Number(prod!.price),
          })),
        services: refs.services
          .map((id) => serviceById.get(id))
          .filter(Boolean)
          .map((svc) => ({
            id: svc!.id,
            titleJson: svc!.titleJson,
            basePrice: Number(svc!.basePrice),
            durationMin: svc!.durationMin,
          })),
      },
    };
  });
}

export const beautyPostsRouter = router({
  // UGC feed — approved posts, newest first.
  feed: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const posts = await prisma.beautyPost.findMany({
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: input?.limit ?? 20,
      });
      return enrichPosts(posts as never, ctx.user ?? null);
    }),

  // Homepage row — admin-curated featured posts.
  featured: publicProcedure.query(async ({ ctx }) => {
    const posts = await prisma.beautyPost.findMany({
      where: { featured: true, isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    return enrichPosts(posts as never, ctx.user ?? null);
  }),

  myPosts: protectedProcedure.query(({ ctx }) =>
    prisma.beautyPost.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ),

  create: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        caption: z.string().max(300).optional(),
        productIds: z.array(z.number().int().positive()).max(10).default([]),
        serviceIds: z.array(z.number().int().positive()).max(10).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Shoppable tags must reference real, active items.
      if (input.productIds.length > 0) {
        const found = await prisma.product.count({
          where: { id: { in: input.productIds }, isActive: true },
        });
        if (found !== input.productIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'One or more tagged products were not found',
          });
        }
      }
      if (input.serviceIds.length > 0) {
        const found = await prisma.service.count({
          where: { id: { in: input.serviceIds }, isActive: true },
        });
        if (found !== input.serviceIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'One or more tagged services were not found',
          });
        }
      }

      return prisma.beautyPost.create({
        data: {
          userId: ctx.user.id,
          imageUrl: input.imageUrl,
          caption: input.caption ?? null,
          tagsJson: {
            products: input.productIds,
            services: input.serviceIds,
          } as unknown as Prisma.InputJsonValue,
        },
      });
    }),

  like: customerProcedure
    .input(z.object({ postId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.beautyPostLike.findUnique({
        where: { postId_userId: { postId: input.postId, userId: ctx.user.id } },
      });
      if (existing) {
        await prisma.beautyPostLike.delete({ where: { id: existing.id } });
        const post = await prisma.beautyPost.update({
          where: { id: input.postId },
          data: { likes: { decrement: 1 } },
        });
        return { liked: false, likes: Math.max(0, post.likes) };
      }
      await prisma.beautyPostLike.create({
        data: { postId: input.postId, userId: ctx.user.id },
      });
      const post = await prisma.beautyPost.update({
        where: { id: input.postId },
        data: { likes: { increment: 1 } },
      });
      return { liked: true, likes: post.likes };
    }),

  comments: publicProcedure
    .input(z.object({ postId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const rows = await prisma.beautyPostComment.findMany({
        where: { postId: input.postId },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });
      if (rows.length === 0) return [];
      const authors = await prisma.user.findMany({
        where: { id: { in: [...new Set(rows.map((r) => r.userId))] } },
        select: { id: true, name: true },
      });
      const nameById = new Map(authors.map((a) => [a.id, a.name]));
      return rows.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt,
        author: { id: r.userId, name: nameById.get(r.userId) ?? '—' },
      }));
    }),

  addComment: customerProcedure
    .input(z.object({ postId: z.number().int().positive(), content: z.string().min(1).max(500) }))
    .mutation(({ ctx, input }) =>
      prisma.beautyPostComment.create({
        data: { postId: input.postId, userId: ctx.user.id, content: input.content },
      }),
    ),

  // View counting — shorts precedent (counter increment, no per-user dedupe).
  viewed: publicProcedure
    .input(z.object({ postId: z.number().int().positive() }))
    .mutation(({ input }) =>
      prisma.beautyPost.update({
        where: { id: input.postId },
        data: { views: { increment: 1 } },
      }),
    ),

  // Shoppable tag analytics — the "clicks → conversions" story.
  tagClick: customerProcedure
    .input(
      z.object({
        postId: z.number().int().positive(),
        kind: z.enum(['product_click', 'service_click']),
        targetId: z.number().int().positive(),
      }),
    )
    .mutation(({ ctx, input }) =>
      prisma.beautyPostEngagement.create({
        data: {
          postId: input.postId,
          userId: ctx.user.id,
          kind: input.kind,
          targetId: input.targetId,
        },
      }),
    ),

  // Admin curation for the homepage row.
  setFeatured: adminProcedure
    .input(z.object({ postId: z.number().int().positive(), featured: z.boolean() }))
    .mutation(({ input }) =>
      prisma.beautyPost.update({
        where: { id: input.postId },
        data: { featured: input.featured },
      }),
    ),
});
