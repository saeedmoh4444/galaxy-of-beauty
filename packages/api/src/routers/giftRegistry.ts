import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { MEDIUM_PAGE_SIZE } from '@galaxy/shared';
import { customerProcedure, protectedProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const giftRegistryRouter = router({
  myRegistries: customerProcedure.query(async ({ ctx }) =>
    db.giftRegistry.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } }),
  ),
  create: customerProcedure
    .input(
      z.object({
        title: z.string().min(2),
        occasion: z.enum(['wedding', 'birthday', 'baby_shower', 'other']),
        targetAmount: z.number().positive(),
        serviceIds: z.array(z.number()),
        message: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      db.giftRegistry.create({ data: { userId: ctx.user.id, ...input } }),
    ),
  contribute: protectedProcedure
    .input(
      z.object({
        registryId: z.number(),
        contributorName: z.string().min(2),
        amount: z.number().positive(),
        message: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const c = await db.giftRegistryContribution.create({ data: input });
      await db.giftRegistry.update({
        where: { id: input.registryId },
        data: { raisedAmount: { increment: input.amount } },
      });
      return c;
    }),
  publicList: protectedProcedure
    .input(z.object({ page: z.number().default(1) }))
    .query(async ({ input }) =>
      db.giftRegistry.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * 12,
        take: MEDIUM_PAGE_SIZE,
      }),
    ),
});
