import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

export const dvSupportRouter = router({
  requestService: customerProcedure
    .input(
      z.object({
        serviceType: z.string().min(1).max(100),
        partnerShelter: z.string().optional(),
        message: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.dvSupportRequest.create({
        data: {
          userId: ctx.user.id,
          serviceType: input.serviceType,
          partnerShelter: input.partnerShelter ?? null,
          message: input.message ?? null,
          confidential: true,
        },
      });
    }),

  stats: publicProcedure.query(async () => {
    const count = await prisma.dvSupportRequest.count();
    return { survivorsServed: count, message: 'كل امرأة تستحق بداية جديدة' };
  }),

  myRequests: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) =>
      prisma.dvSupportRequest.findMany({
        where: { userId: ctx.user.id },
        take: input.limit,
        orderBy: { createdAt: 'desc' },
      }),
    ),
});
