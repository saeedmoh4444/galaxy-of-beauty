import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const socialChallengesRouter = router({
  myChallenges: customerProcedure.query(async ({ ctx }) => {
    return prisma.challengeParticipant.findMany({
      where: { userId: ctx.user.id },
      orderBy: { joinedAt: 'desc' },
    });
  }),
  join: customerProcedure
    .input(z.object({ challengeKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.challengeParticipant.upsert({
        where: { userId_challengeKey: { userId: ctx.user.id, challengeKey: input.challengeKey } },
        create: { userId: ctx.user.id, challengeKey: input.challengeKey },
        update: {},
      });
    }),
  leave: customerProcedure
    .input(z.object({ challengeKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.challengeParticipant.deleteMany({
        where: { userId: ctx.user.id, challengeKey: input.challengeKey },
      });
      return { success: true };
    }),
  updateProgress: customerProcedure
    .input(z.object({ challengeKey: z.string(), progress: z.number().min(0).max(100) }))
    .mutation(async ({ ctx, input }) => {
      return prisma.challengeParticipant.update({
        where: { userId_challengeKey: { userId: ctx.user.id, challengeKey: input.challengeKey } },
        data: {
          progress: input.progress,
          ...(input.progress >= 100 ? { completedAt: new Date() } : {}),
        },
      });
    }),
});
