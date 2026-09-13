import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, technicianProcedure, router } from '../trpc';

export const serviceQueueRouter = router({
  join: customerProcedure
    .input(
      z.object({
        technicianId: z.number().int().positive(),
        serviceId: z.number().int().positive(),
        notes: z.string().max(200).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      prisma.serviceQueueEntry.create({
        data: {
          userId: ctx.user.id,
          technicianId: input.technicianId,
          serviceId: input.serviceId,
          notes: input.notes ?? null,
        },
      }),
    ),

  myPosition: customerProcedure.query(async ({ ctx }) => {
    const entry = await prisma.serviceQueueEntry.findFirst({
      where: { userId: ctx.user.id, status: 'WAITING' },
      orderBy: { createdAt: 'asc' },
    });
    if (!entry) return null;
    const ahead = await prisma.serviceQueueEntry.count({
      where: {
        technicianId: entry.technicianId,
        status: 'WAITING',
        createdAt: { lt: entry.createdAt },
      },
    });
    return { position: ahead + 1, entry };
  }),

  queueForTech: technicianProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(10) }))
    .query(async ({ ctx, input }) => {
      const tech = await prisma.technician.findUnique({ where: { userId: ctx.user.id } });
      if (!tech) return [];
      return prisma.serviceQueueEntry.findMany({
        where: { technicianId: tech.id, status: 'WAITING' },
        take: input.limit,
        orderBy: { createdAt: 'asc' },
      });
    }),
});
