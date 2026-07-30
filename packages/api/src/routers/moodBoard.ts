import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const moodBoardRouter = router({
  list: customerProcedure.query(async ({ ctx }) =>
    prisma.moodBoard.findMany({ where: { userId: ctx.user.id }, include: { pins: true }, orderBy: { createdAt: 'desc' } })),

  create: customerProcedure
    .input(z.object({ name: z.string().min(1).max(100), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) =>
      prisma.moodBoard.create({ data: { userId: ctx.user.id, name: input.name, description: input.description ?? '' }, include: { pins: true } })),

  addPin: customerProcedure
    .input(z.object({ boardId: z.number(), imageUrl: z.string(), title: z.string().optional(), note: z.string().optional(), tags: z.array(z.string()).default([]), serviceId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const board = await prisma.moodBoard.findFirst({ where: { id: input.boardId, userId: ctx.user.id } });
      if (!board) throw new Error('اللوحة غير موجودة');
      const pin = await prisma.moodBoardPin.create({ data: { boardId: input.boardId, imageUrl: input.imageUrl, title: input.title ?? '', note: input.note ?? '', tags: input.tags, serviceId: input.serviceId ?? null } });
      if (!board.coverUrl) await prisma.moodBoard.update({ where: { id: input.boardId }, data: { coverUrl: input.imageUrl } });
      return pin;
    }),

  removePin: customerProcedure
    .input(z.object({ boardId: z.number(), pinId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.moodBoardPin.deleteMany({ where: { id: input.pinId, boardId: input.boardId } });
      return { success: true };
    }),

  delete: customerProcedure
    .input(z.object({ boardId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.moodBoard.deleteMany({ where: { id: input.boardId, userId: ctx.user.id } });
      return { success: true };
    }),
});
