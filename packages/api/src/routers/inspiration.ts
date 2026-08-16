import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, customerMutation, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const inspirationRouter = router({
  list: customerProcedure.query(async ({ ctx }) =>
    db.inspirationPin.findMany({
      where: { userId: ctx.user.id },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
  ),

  create: customerMutation
    .input(
      z.object({
        imageUrl: z.string().optional(),
        title: z.string().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).default([]),
        serviceId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // New pins go to the end of the board
      const last = await db.inspirationPin.findFirst({
        where: { userId: ctx.user.id },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      return db.inspirationPin.create({
        data: { userId: ctx.user.id, ...input, sortOrder: (last?.sortOrder ?? 0) + 1 },
      });
    }),

  /**
   * Persist a drag-and-drop reorder: pinIds is the full ordered id list.
   */
  reorder: customerMutation
    .input(z.object({ pinIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      await prisma.$transaction(
        input.pinIds.map((pinId, index) =>
          db.inspirationPin.updateMany({
            where: { id: pinId, userId: ctx.user.id },
            data: { sortOrder: index },
          }),
        ),
      );
      return { success: true };
    }),

  delete: customerMutation.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.inspirationPin.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),
});
