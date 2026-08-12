import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const dailyBeautyTipRouter = router({
  today: publicProcedure.query(async () => {
    const count = await prisma.dailyBeautyTip.count();
    if (count === 0) return null;
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const skip = dayOfYear % count;
    return prisma.dailyBeautyTip.findFirst({ skip, take: 1 });
  }),

  list: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ input }) => {
      const [items, total] = await Promise.all([
        prisma.dailyBeautyTip.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.dailyBeautyTip.count(),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  create: adminProcedure
    .input(
      z.object({
        emoji: z.string().default('💡'),
        tip: z.string().min(5).max(300),
        category: z.string().default('عناية'),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.dailyBeautyTip.create({
        data: { emoji: input.emoji, tip: input.tip, category: input.category },
      });
    }),
});
