import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, customerMutation, router } from '../trpc';

export const moodBoardRouter = router({
  list: customerProcedure.query(async ({ ctx }) =>
    prisma.moodBoard.findMany({
      where: { userId: ctx.user.id },
      include: { pins: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ),

  create: customerMutation
    .input(z.object({ name: z.string().min(1).max(100), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) =>
      prisma.moodBoard.create({
        data: { userId: ctx.user.id, name: input.name, description: input.description ?? '' },
        include: { pins: true },
      }),
    ),

  addPin: customerMutation
    .input(
      z.object({
        boardId: z.number(),
        imageUrl: z.string(),
        title: z.string().optional(),
        note: z.string().optional(),
        tags: z.array(z.string()).default([]),
        serviceId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const board = await prisma.moodBoard.findFirst({
        where: { id: input.boardId, userId: ctx.user.id },
      });
      if (!board) throw new Error('اللوحة غير موجودة');
      // New pins go to the end of the board
      const last = await prisma.moodBoardPin.findFirst({
        where: { boardId: input.boardId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      const pin = await prisma.moodBoardPin.create({
        data: {
          boardId: input.boardId,
          imageUrl: input.imageUrl,
          title: input.title ?? '',
          note: input.note ?? '',
          tags: input.tags,
          serviceId: input.serviceId ?? null,
          sortOrder: (last?.sortOrder ?? 0) + 1,
        },
      });
      if (!board.coverUrl)
        await prisma.moodBoard.update({
          where: { id: input.boardId },
          data: { coverUrl: input.imageUrl },
        });
      return pin;
    }),

  /**
   * Persist a drag-and-drop reorder of a board's pins: pinIds is the full
   * ordered id list for that board.
   */
  reorderPins: customerMutation
    .input(z.object({ boardId: z.number(), pinIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const board = await prisma.moodBoard.findFirst({
        where: { id: input.boardId, userId: ctx.user.id },
      });
      if (!board) throw new Error('اللوحة غير موجودة');
      await prisma.$transaction(
        input.pinIds.map((pinId, index) =>
          prisma.moodBoardPin.updateMany({
            where: { id: pinId, boardId: input.boardId },
            data: { sortOrder: index },
          }),
        ),
      );
      return { success: true };
    }),

  removePin: customerMutation
    .input(z.object({ boardId: z.number(), pinId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const board = await prisma.moodBoard.findFirst({
        where: { id: input.boardId, userId: ctx.user.id },
      });
      if (!board) throw new Error('اللوحة غير موجودة');
      await prisma.moodBoardPin.deleteMany({ where: { id: input.pinId, boardId: input.boardId } });
      return { success: true };
    }),

  delete: customerMutation
    .input(z.object({ boardId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.moodBoard.deleteMany({ where: { id: input.boardId, userId: ctx.user.id } });
      return { success: true };
    }),
});
