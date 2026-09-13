import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const expertTalksRouter = router({
  upcoming: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ input }) =>
      prisma.expertTalk.findMany({
        where: { date: { gte: new Date().toISOString().slice(0, 10) } },
        orderBy: { date: 'asc' },
        take: input.limit,
      }),
    ),

  list: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input }) =>
      prisma.expertTalk.findMany({ orderBy: { date: 'desc' }, take: input.limit }),
    ),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(3).max(200),
        expert: z.string().min(2).max(100),
        date: z.string(),
        seats: z.number().int().positive().optional(),
        isFree: z.boolean().default(true),
        emoji: z.string().default(''),
      }),
    )
    .mutation(async ({ input }) =>
      prisma.expertTalk.create({
        data: {
          title: input.title,
          expert: input.expert,
          date: input.date,
          seats: input.seats ?? null,
          isFree: input.isFree,
          emoji: input.emoji,
        },
      }),
    ),
});
