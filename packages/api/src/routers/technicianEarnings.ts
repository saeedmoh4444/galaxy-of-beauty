import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { technicianProcedure, router } from '../trpc';

export const technicianEarningsRouter = router({
  summary: technicianProcedure.query(async ({ ctx }) => {
    const tech = await prisma.technician.findUnique({ where: { userId: ctx.user.id } });
    if (!tech) return null;
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [thisMonth, lastMonth, totalEarned, feesThisMonth] = await Promise.all([
      prisma.payout.aggregate({
        where: {
          // Payout.technicianId references User.id (FK), not the
          // Technician profile id — filtering by tech.id returned
          // zeros for every real technician.
          technicianId: ctx.user.id,
          createdAt: { gte: monthStart },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.payout.aggregate({
        where: {
          technicianId: ctx.user.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.payout.aggregate({
        where: { technicianId: ctx.user.id, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      // W4-1 — the platform fee IS the technician's real expense line;
      // the pro-tools profit dashboard used a fabricated 3200 before.
      prisma.payout.aggregate({
        where: { technicianId: ctx.user.id, status: 'COMPLETED', createdAt: { gte: monthStart } },
        _sum: { fee: true },
      }),
    ]);
    return {
      thisMonth: Number(thisMonth._sum.amount ?? 0),
      lastMonth: Number(lastMonth._sum.amount ?? 0),
      totalEarned: Number(totalEarned._sum.amount ?? 0),
      feesThisMonth: Number(feesThisMonth._sum.fee ?? 0),
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
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1); // exclusive next-month start
        const result = await prisma.payout.aggregate({
          where: {
            technicianId: ctx.user.id,
            createdAt: { gte: start, lt: end },
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
