import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

export const socialImpactRouter = router({
  stats: publicProcedure.query(async () => {
    const [womenEmployed, womenInTraining, survivorServices, ruralWomen] = await Promise.all([
      prisma.socialImpact.aggregate({ where: { category: 'EMPLOYED' }, _sum: { count: true } }),
      prisma.socialImpact.aggregate({ where: { category: 'TRAINING' }, _sum: { count: true } }),
      prisma.socialImpact.aggregate({
        where: { category: 'SURVIVOR_SERVICE' },
        _sum: { count: true },
      }),
      prisma.socialImpact.aggregate({ where: { category: 'RURAL' }, _sum: { count: true } }),
    ]);
    return {
      womenEmployed: womenEmployed._sum.count ?? 0,
      womenInTraining: womenInTraining._sum.count ?? 0,
      survivorServices: survivorServices._sum.count ?? 0,
      ruralWomen: ruralWomen._sum.count ?? 0,
      goal: 1000,
    };
  }),

  milestones: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ input }) =>
      prisma.socialImpact.findMany({ orderBy: { createdAt: 'desc' }, take: input.limit }),
    ),
});
