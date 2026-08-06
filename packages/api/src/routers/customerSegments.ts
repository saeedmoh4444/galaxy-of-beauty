import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { adminProcedure, router } from '../trpc';

export const customerSegmentsRouter = router({
  list: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input }) => prisma.customerSegment.findMany({ take: input.limit, orderBy: { createdAt: 'desc' } })),

  create: adminProcedure
    .input(z.object({ name: z.string().min(2).max(100), criteria: z.record(z.unknown()), description: z.string().max(500).optional() }))
    .mutation(async ({ input }) => prisma.customerSegment.create({ data: { name: input.name, criteria: input.criteria, description: input.description ?? null } })),

  count: adminProcedure
    .input(z.object({ segmentId: z.number().int().positive() }))
    .query(async () => ({ count: 0, message: 'Segmentation engine — coming soon' })),
});
