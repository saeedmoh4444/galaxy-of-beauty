import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const ruralOutreachRouter = router({
  stats: publicProcedure.query(async () => {
    const [trained, employed, villages] = await Promise.all([
      prisma.ruralOutreach.count({ where: { status: 'TRAINED' } }),
      prisma.ruralOutreach.count({ where: { status: 'EMPLOYED' } }),
      prisma.ruralOutreach.groupBy({ by: ['village'], _count: true }),
    ]);
    return { trained, employed, villages: villages.length, target: 200 };
  }),

  list: adminProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().int().min(1).max(200).default(50) }))
    .query(async ({ input }) => {
      const where = input.status ? { status: input.status } : {};
      return prisma.ruralOutreach.findMany({ where, take: input.limit, orderBy: { createdAt: 'desc' } });
    }),

  create: adminProcedure
    .input(z.object({ name: z.string().min(2).max(100), village: z.string().min(1).max(100), status: z.string().default('TRAINED') }))
    .mutation(async ({ input }) => prisma.ruralOutreach.create({ data: { name: input.name, village: input.village, status: input.status } })),
});
