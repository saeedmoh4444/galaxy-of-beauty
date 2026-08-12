import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const inspirationRouter = router({
  list: customerProcedure.query(async ({ ctx }) =>
    db.inspirationPin.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } }),
  ),
  create: customerProcedure
    .input(
      z.object({
        imageUrl: z.string().optional(),
        title: z.string().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).default([]),
        serviceId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      db.inspirationPin.create({ data: { userId: ctx.user.id, ...input } }),
    ),
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.inspirationPin.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),
});
