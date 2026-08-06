import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const beautyInsightsRouter = router({
  myInsights: customerProcedure.query(async ({ ctx }) => {
    const [bookings, reviews, totalSpent, avgRating] = await Promise.all([
      prisma.booking.count({ where: { customerId: ctx.user.id } }),
      prisma.review.count({ where: { customerId: ctx.user.id } }),
      prisma.booking.aggregate({ where: { customerId: ctx.user.id, status: 'COMPLETED' }, _sum: { totalAmount: true } }),
      prisma.review.aggregate({ where: { customerId: ctx.user.id }, _avg: { rating: true } }),
    ]);
    const favCategory = await prisma.booking.groupBy({ by: ['serviceId'], where: { customerId: ctx.user.id }, _count: true, orderBy: { _count: { serviceId: 'desc' } }, take: 1 });
    return {
      totalBookings: bookings,
      totalReviews: reviews,
      totalSpent: totalSpent._sum.totalAmount ?? 0,
      avgRating: Math.round((avgRating._avg.rating ?? 0) * 10) / 10,
      favoriteCategory: favCategory[0]?.serviceId ?? null,
    };
  }),

  spendingTrend: customerProcedure
    .input(z.object({ months: z.number().int().min(1).max(12).default(6) }))
    .query(async ({ ctx, input }) => {
      const trends: Array<{ month: string; total: number }> = [];
      const now = new Date();
      for (let i = input.months - 1; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const result = await prisma.booking.aggregate({ where: { customerId: ctx.user.id, createdAt: { gte: start, lte: end }, status: 'COMPLETED' }, _sum: { totalAmount: true } });
        trends.push({ month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`, total: Number(result._sum.totalAmount ?? 0) });
      }
      return trends;
    }),
});
