import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const timeCapsuleRouter = router({
  save: customerProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        routineJson: z.record(z.unknown()),
        openDate: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.timeCapsule.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          routineJson: input.routineJson as any,
          openDate: input.openDate,
        },
      });
    }),

  myCapsules: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      return prisma.timeCapsule.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });
    }),

  open: customerProcedure
    .input(z.object({ capsuleId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const capsule = await prisma.timeCapsule.findFirst({
        where: { id: input.capsuleId, userId: ctx.user.id },
      });
      if (!capsule) return null;
      await prisma.timeCapsule.update({ where: { id: capsule.id }, data: { opened: true } });
      return capsule;
    }),

  upcoming: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(10).default(3) }))
    .query(async ({ ctx, input }) => {
      return prisma.timeCapsule.findMany({
        where: {
          userId: ctx.user.id,
          opened: false,
          openDate: { gte: new Date().toISOString().slice(0, 10) },
        },
        orderBy: { openDate: 'asc' },
        take: input.limit,
      });
    }),
});
