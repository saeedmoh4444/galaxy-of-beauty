import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { adminProcedure, router } from '../trpc';

export const customerRetentionRouter = router({
  stats: adminProcedure.query(async () => {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const [totalCustomers, activeThisMonth, returningThisMonth] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.booking.groupBy({ by: ['customerId'], where: { createdAt: { gte: monthAgo } }, _count: true }),
      prisma.booking.groupBy({ by: ['customerId'], where: { createdAt: { lt: monthAgo } }, _count: true }),
    ]);
    const activeIds = new Set(activeThisMonth.map((a) => a.customerId));
    const returningCount = returningThisMonth.filter((r) => activeIds.has(r.customerId)).length;
    return { totalCustomers, activeThisMonth: activeThisMonth.length, returningRate: totalCustomers > 0 ? Math.round((returningCount / totalCustomers) * 100) : 0 };
  }),

  churnRisk: adminProcedure
    .input(z.object({ monthsInactive: z.number().int().min(1).max(12).default(3) }))
    .query(async ({ input }) => {
      const since = new Date(Date.now() - input.monthsInactive * 30 * 86400000);
      const allCustomers = await prisma.booking.groupBy({ by: ['customerId'], where: { createdAt: { lt: since } }, _count: true });
      const activeSince = await prisma.booking.groupBy({ by: ['customerId'], where: { createdAt: { gte: since } }, _count: true });
      const activeIds = new Set(activeSince.map((a) => a.customerId));
      const churned = allCustomers.filter((c) => !activeIds.has(c.customerId));
      return { atRiskCount: churned.length, monthsInactive: input.monthsInactive };
    }),
});
