import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const beautyPlansRouter = router({
  // Public: list all active plans
  list: publicProcedure.query(async () => {
    return prisma.beautyPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }),

  // Admin: list all
  adminList: adminProcedure.query(async () => {
    return prisma.beautyPlan.findMany({ orderBy: { createdAt: 'desc' } });
  }),
});
