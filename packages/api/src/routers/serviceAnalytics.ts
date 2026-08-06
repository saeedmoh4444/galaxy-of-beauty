import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { adminProcedure, router } from '../trpc';

export const serviceAnalyticsRouter = router({
  topServices: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(10), period: z.enum(['month', 'year']).default('month') }))
    .query(async ({ input }) => {
      const days = input.period === 'month' ? 30 : 365;
      const since = new Date(Date.now() - days * 86400000);
      const top = await prisma.booking.groupBy({ by: ['serviceId'], where: { createdAt: { gte: since } }, _count: true, orderBy: { _count: { serviceId: 'desc' } }, take: input.limit });
      return top;
    }),

  serviceStats: adminProcedure
    .input(z.object({ serviceId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const [bookings, revenue, avgRating] = await Promise.all([
        prisma.booking.count({ where: { serviceId: input.serviceId } }),
        prisma.booking.aggregate({ where: { serviceId: input.serviceId, status: 'COMPLETED' }, _sum: { totalAmount: true } }),
        prisma.review.aggregate({ where: { booking: { serviceId: input.serviceId } }, _avg: { rating: true } }),
      ]);
      return { bookings, revenue: revenue._sum.totalAmount ?? 0, avgRating: Math.round((avgRating._avg.rating ?? 0) * 10) / 10 };
    }),
});
