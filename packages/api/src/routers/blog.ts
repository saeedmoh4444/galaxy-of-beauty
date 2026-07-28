import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const blogRouter = router({
  // Published posts (public, paginated)
  list: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(9), search: z.string().optional() }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { isPublished: true };
      if (input.search) {
        where.OR = [
          { titleJson: { path: ['ar'], string_contains: input.search } },
          { titleJson: { path: ['en'], string_contains: input.search } },
          { tags: { hasSome: [input.search] } },
        ];
      }
      const [items, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          orderBy: { publishedAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.blogPost.count({ where }),
      ]);
      return { items, total, page: input.page, limit: input.limit };
    }),

  // Single post by slug (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await prisma.blogPost.findUnique({ where: { slug: input.slug } });
      if (!post || !post.isPublished) throw new Error('Post not found');
      return post;
    }),

  // Admin: create post
  create: adminProcedure
    .input(z.object({
      titleAr: z.string().min(1), titleEn: z.string().min(1),
      bodyAr: z.string().min(1), bodyEn: z.string().min(1),
      slug: z.string().min(1), imageUrl: z.string().optional(),
      tags: z.array(z.string()).default([]), isPublished: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      return prisma.blogPost.create({
        data: {
          titleJson: { ar: input.titleAr, en: input.titleEn },
          bodyJson: { ar: input.bodyAr, en: input.bodyEn },
          slug: input.slug, imageUrl: input.imageUrl, tags: input.tags,
          isPublished: input.isPublished,
          publishedAt: input.isPublished ? new Date() : null,
        },
      });
    }),

  // Admin: list all (including drafts)
  listAll: adminProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const [items, total] = await Promise.all([
        prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' }, skip: (input.page - 1) * input.limit, take: input.limit }),
        prisma.blogPost.count(),
      ]);
      return { items, total };
    }),
});
