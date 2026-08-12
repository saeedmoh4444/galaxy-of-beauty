import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, adminProcedure, router } from '../trpc';

export const certificationPathsRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) =>
      prisma.certificationPath.findMany({ where: { isActive: true }, take: input.limit }),
    ),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => prisma.certificationPath.findUnique({ where: { id: input.id } })),

  enroll: customerProcedure
    .input(z.object({ pathId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.certificationEnrollment.findUnique({
        where: { userId_pathId: { userId: ctx.user.id, pathId: input.pathId } },
      });
      if (!existing)
        await prisma.certificationEnrollment.create({
          data: { userId: ctx.user.id, pathId: input.pathId },
        });
      return { success: true };
    }),

  myEnrollments: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) =>
      prisma.certificationEnrollment.findMany({
        where: { userId: ctx.user.id },
        include: { path: true },
        take: input.limit,
      }),
    ),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(3).max(200),
        emoji: z.string().default(''),
        levelsJson: z.array(z.string()),
        duration: z.string(),
        accredited: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) =>
      prisma.certificationPath.create({
        data: {
          title: input.title,
          emoji: input.emoji,
          levelsJson: input.levelsJson,
          duration: input.duration,
          accredited: input.accredited,
        },
      }),
    ),
});
