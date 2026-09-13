import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const liveStreamRouter = router({
  // Public: upcoming and live streams
  upcoming: publicProcedure
    .input(z.object({ limit: z.number().default(6) }).optional())
    .query(async ({ input }) => {
      const now = new Date();
      return prisma.liveStream.findMany({
        where: {
          OR: [{ status: 'LIVE' }, { status: 'SCHEDULED', scheduledAt: { gte: now } }],
        },
        orderBy: [{ status: 'asc' }, { scheduledAt: 'asc' }],
        take: input?.limit ?? 6,
      });
    }),

  // Public: past streams
  past: publicProcedure
    .input(z.object({ limit: z.number().default(10) }).optional())
    .query(async ({ input }) => {
      return prisma.liveStream.findMany({
        where: { status: 'ENDED' },
        orderBy: { endedAt: 'desc' },
        take: input?.limit ?? 10,
      });
    }),

  // Admin: list all
  adminList: adminProcedure.query(async () => {
    return prisma.liveStream.findMany({ orderBy: { scheduledAt: 'desc' } });
  }),

  // Admin: create
  create: adminProcedure
    .input(
      z.object({
        technicianId: z.number(),
        titleJson: z.object({ ar: z.string(), en: z.string() }),
        descriptionJson: z.object({ ar: z.string(), en: z.string() }).optional(),
        category: z.string().default('makeup'),
        scheduledAt: z.string().datetime(),
        isFeatured: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.liveStream.create({ data: input });
    }),

  // Admin: update status
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED']),
        streamUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (data.status === 'LIVE') updateData.startedAt = new Date();
      if (data.status === 'ENDED') updateData.endedAt = new Date();
      return prisma.liveStream.update({ where: { id }, data: updateData as any });
    }),
});
