import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { EXPERIMENTAL_FEATURES } from '@galaxy/shared';
import { publicProcedure, adminProcedure, router, requireFeatureFlag } from '../trpc';

const flag = requireFeatureFlag(EXPERIMENTAL_FEATURES.BEAUTY_TRENDS);

export const beautyTrendsRouter = router({
  topServices: publicProcedure
    .use(flag)
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(10),
        period: z.enum(['week', 'month', 'year']).default('month'),
      }),
    )
    .query(async ({ input }) => {
      const since = input.period === 'week' ? 7 : input.period === 'month' ? 30 : 365;
      const sinceDate = new Date(Date.now() - since * 86400000);
      const trending = await prisma.booking.groupBy({
        by: ['serviceId'],
        where: { createdAt: { gte: sinceDate }, status: 'COMPLETED' },
        _count: true,
        orderBy: { _count: { serviceId: 'desc' } },
        take: input.limit,
      });
      return trending;
    }),

  topTechnicians: publicProcedure
    .use(flag)
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ input }) => {
      const topRated = await prisma.technician.findMany({
        where: { kycStatus: 'VERIFIED' },
        orderBy: { ratingAvg: 'desc' },
        take: input.limit,
        select: {
          userId: true,
          ratingAvg: true,
          completedBookings: true,
          user: { select: { name: true, avatarUrl: true } },
        },
      });
      return topRated;
    }),

  topCategories: publicProcedure
    .use(flag)
    .input(z.object({ limit: z.number().int().min(1).max(10).default(5) }))
    .query(async ({ input }) => {
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const bookings = await prisma.booking.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: {
          service: { select: { categoryId: true, category: { select: { nameJson: true } } } },
        },
        take: 1000,
      });
      const counts: Record<number, number> = {};
      for (const b of bookings) {
        const catId = b.service?.categoryId ?? 0;
        counts[catId] = (counts[catId] ?? 0) + 1;
      }
      return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, input.limit)
        .map(([catId, count]) => ({ categoryId: Number(catId), count }));
    }),

  record: adminProcedure
    .input(z.object({ type: z.string(), data: z.record(z.unknown()) }))
    .mutation(async ({ input }) =>
      prisma.beautyTrend.create({ data: { type: input.type, data: input.data as any } }),
    ),
});
