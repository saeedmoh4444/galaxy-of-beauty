import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const serviceBundlesRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(12) }))
    .query(async ({ input }) =>
      prisma.serviceBundle.findMany({
        where: { isActive: true },
        take: input.limit,
        orderBy: { price: 'asc' },
      }),
    ),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) =>
      prisma.serviceBundle.findUnique({
        where: { id: input.id },
        include: { bundleServices: { include: { service: true } } },
      }),
    ),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(3).max(200),
        emoji: z.string().default('🎁'),
        price: z.number().int().positive(),
        serviceIds: z.array(z.number().int().positive()),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const bundle = await prisma.serviceBundle.create({
        data: {
          name: input.name,
          emoji: input.emoji,
          price: input.price,
          description: input.description ?? null,
        },
      });
      await prisma.bundleService.createMany({
        data: input.serviceIds.map((sid, i) => ({
          bundleId: bundle.id,
          serviceId: sid,
          sortOrder: i,
        })),
      });
      return bundle;
    }),
});
