import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { adminProcedure, router } from '../trpc';

export const beautyReportsRouter = router({
  generate: adminProcedure
    .input(
      z.object({
        type: z.enum(['bookings', 'revenue', 'customers', 'technicians']),
        period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
      }),
    )
    .query(async ({ input }) => {
      const days =
        input.period === 'week'
          ? 7
          : input.period === 'month'
            ? 30
            : input.period === 'quarter'
              ? 90
              : 365;
      const since = new Date(Date.now() - days * 86400000);
      const [bookings, revenue, customers] = await Promise.all([
        prisma.booking.count({ where: { createdAt: { gte: since } } }),
        prisma.payment.aggregate({
          where: { createdAt: { gte: since }, status: 'CAPTURED' },
          _sum: { amount: true },
        }),
        prisma.user.count({ where: { createdAt: { gte: since } } }),
      ]);
      return {
        period: input.period,
        bookings,
        revenue: revenue._sum.amount ?? 0,
        newCustomers: customers,
        generatedAt: new Date().toISOString(),
      };
    }),

  listReports: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ input }) =>
      prisma.beautyReport.findMany({ take: input.limit, orderBy: { createdAt: 'desc' } }),
    ),

  save: adminProcedure
    .input(z.object({ type: z.string(), data: z.record(z.unknown()) }))
    .mutation(async ({ input }) =>
      prisma.beautyReport.create({ data: { type: input.type, data: input.data as any } }),
    ),
});
