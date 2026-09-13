import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { technicianProcedure, adminProcedure, router } from '../trpc';
import { notFound } from '../lib/errors';

export const technicianVerificationRouter = router({
  myBadges: technicianProcedure.query(async ({ ctx }) => {
    const tech = await prisma.technician.findUnique({ where: { userId: ctx.user.id } });
    if (!tech) throw notFound('Technician profile');
    return prisma.technicianBadgeAssignment.findMany({
      where: { technicianId: tech.id },
      include: { badge: true },
    });
  }),

  requestBadge: technicianProcedure
    .input(z.object({ badgeId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const tech = await prisma.technician.findUnique({ where: { userId: ctx.user.id } });
      if (!tech) throw notFound('Technician profile');
      await prisma.technicianBadgeAssignment.create({
        data: { technicianId: tech.id, badgeId: input.badgeId },
      });
      return { success: true };
    }),

  listBadges: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input }) => prisma.technicianBadge.findMany({ take: input.limit })),

  createBadge: adminProcedure
    .input(
      z.object({
        nameJson: z.record(z.string()),
        emoji: z.string().default(''),
        criteria: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) =>
      prisma.technicianBadge.create({
        data: {
          nameJson: input.nameJson as any,
          emoji: input.emoji,
          criteria: input.criteria ?? null,
        } as any,
      }),
    ),
});
