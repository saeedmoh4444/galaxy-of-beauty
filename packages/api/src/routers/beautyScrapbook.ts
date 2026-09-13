import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const beautyScrapbookRouter = router({
  myMemories: customerProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(30).default(10),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [items, total] = await Promise.all([
        prisma.beautyMemory.findMany({
          where: { userId: ctx.user.id },
          orderBy: { date: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.beautyMemory.count({ where: { userId: ctx.user.id } }),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  add: customerProcedure
    .input(
      z.object({
        title: z.string().min(2).max(200),
        date: z.string(),
        emoji: z.string().default(''),
        imageUrl: z.string().optional(),
        notes: z.string().max(500).optional(),
        tags: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      prisma.beautyMemory.create({
        data: {
          userId: ctx.user.id,
          title: input.title,
          date: input.date,
          emoji: input.emoji,
          imageUrl: input.imageUrl ?? null,
          notes: input.notes ?? null,
          tags: input.tags,
        },
      }),
    ),

  delete: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const memory = await prisma.beautyMemory.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (memory) await prisma.beautyMemory.delete({ where: { id: memory.id } });
      return { success: true };
    }),

  byTag: customerProcedure
    .input(z.object({ tag: z.string(), limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) =>
      prisma.beautyMemory.findMany({
        where: { userId: ctx.user.id, tags: { has: input.tag } as any },
        take: input.limit,
        orderBy: { date: 'desc' },
      }),
    ),
});
