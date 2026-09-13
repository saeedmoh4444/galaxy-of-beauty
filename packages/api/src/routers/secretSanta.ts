import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { EXPERIMENTAL_FEATURES } from '@galaxy/shared';
import { customerProcedure, router, requireFeatureFlag } from '../trpc';

const flag = requireFeatureFlag(EXPERIMENTAL_FEATURES.SECRET_SANTA);

export const secretSantaRouter = router({
  createGroup: customerProcedure
    .use(flag)
    .input(
      z.object({
        name: z.string().min(2).max(100),
        budget: z.number().int().positive(),
        drawDate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.secretSantaGroup.create({
        data: {
          name: input.name,
          budget: input.budget,
          creatorId: ctx.user.id,
          drawDate: input.drawDate ?? null,
        },
      });
    }),

  join: customerProcedure
    .use(flag)
    .input(z.object({ groupId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.secretSantaParticipant.create({
        data: { groupId: input.groupId, userId: ctx.user.id },
      });
      return { success: true };
    }),

  myGroups: customerProcedure
    .use(flag)
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      return prisma.secretSantaParticipant.findMany({
        where: { userId: ctx.user.id },
        include: { group: true },
        take: input.limit,
      });
    }),

  draw: customerProcedure
    .use(flag)
    .input(z.object({ groupId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const group = await prisma.secretSantaGroup.findFirst({
        where: { id: input.groupId, creatorId: ctx.user.id },
      });
      if (!group) return { error: 'Not authorized' };
      const participants = await prisma.secretSantaParticipant.findMany({
        where: { groupId: input.groupId },
      });
      if (participants.length < 2) return { error: 'Need at least 2 participants' };
      // Shuffle and assign
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length; i++) {
        const giver = shuffled[i]!;
        const receiver = shuffled[(i + 1) % shuffled.length]!;
        await prisma.secretSantaParticipant.update({
          where: { id: giver.id },
          data: { assignedTo: receiver.userId },
        });
      }
      await prisma.secretSantaGroup.update({ where: { id: input.groupId }, data: { drawn: true } });
      return { success: true, matches: participants.length };
    }),

  getAssignment: customerProcedure
    .use(flag)
    .input(z.object({ groupId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const participant = await prisma.secretSantaParticipant.findFirst({
        where: { groupId: input.groupId, userId: ctx.user.id },
      });
      if (!participant?.assignedTo) return null;
      const receiver = await prisma.secretSantaParticipant.findFirst({
        where: { groupId: input.groupId, userId: participant.assignedTo },
      });
      return receiver ? { userId: participant.assignedTo } : null;
    }),
});
