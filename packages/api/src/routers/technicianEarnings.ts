import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { technicianProcedure, router } from '../trpc';

export const technicianEarningsRouter = router({
  summary: technicianProcedure.query(async ({ ctx }) => {
    const tech = await prisma.technician.findUnique({ where: { userId: ctx.user.id } });
    if (!tech) return null;
    const [thisMonth, lastMonth, totalEarned] = await Promise.all([
      prisma.payout.aggregate({
        where: {
          technicianId: tech.id,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.payout.aggregate({
        where: {
          technicianId: tech.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.payout.aggregate({
        where: { technicianId: tech.id, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);
    return {
      thisMonth: thisMonth._sum.amount ?? 0,
      lastMonth: lastMonth._sum.amount ?? 0,
      totalEarned: totalEarned._sum.amount ?? 0,
    };
  }),

  monthly: technicianProcedure
    .input(z.object({ months: z.number().int().min(1).max(12).default(6) }))
    .query(async ({ ctx, input }) => {
      const tech = await prisma.technician.findUnique({ where: { userId: ctx.user.id } });
      if (!tech) return [];
      const trends: Array<{ month: string; amount: number }> = [];
      const now = new Date();
      for (let i = input.months - 1; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const result = await prisma.payout.aggregate({
          where: {
            technicianId: tech.id,
            createdAt: { gte: start, lte: end },
            status: 'COMPLETED',
          },
          _sum: { amount: true },
        });
        trends.push({
          month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
          amount: Number(result._sum.amount ?? 0),
        });
      }
      return trends;
    }),
});
