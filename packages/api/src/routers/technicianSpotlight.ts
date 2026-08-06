import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const technicianSpotlightRouter = router({
  current: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(10).default(3) }))
    .query(async ({ input }) => prisma.technicianSpotlight.findMany({ where: { isPublished: true }, take: input.limit, orderBy: { createdAt: 'desc' } })),

  list: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input }) => prisma.technicianSpotlight.findMany({ take: input.limit, orderBy: { createdAt: 'desc' } })),

  create: adminProcedure
    .input(z.object({ technicianId: z.number().int().positive(), story: z.string().min(10).max(2000), achievement: z.string().max(500), emoji: z.string().default('👩‍🎨') }))
    .mutation(async ({ input }) => prisma.technicianSpotlight.create({ data: { technicianId: input.technicianId, story: input.story, achievement: input.achievement, emoji: input.emoji } })),
});
