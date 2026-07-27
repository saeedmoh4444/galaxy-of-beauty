import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, technicianProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const technicianBadgeRouter = router({
  list: publicProcedure.query(async () => db.technicianBadge.findMany()),
  forTechnician: publicProcedure
    .input(z.object({ technicianId: z.number() }))
    .query(async ({ input }) => db.technicianBadgeAssignment.findMany({ where: { technicianId: input.technicianId }, include: { badge: true } })),
  create: adminProcedure
    .input(z.object({ key: z.string(), nameAr: z.string(), nameEn: z.string(), iconUrl: z.string().optional() }))
    .mutation(async ({ input }) => db.technicianBadge.create({ data: { key: input.key, nameJson: { ar: input.nameAr, en: input.nameEn }, iconUrl: input.iconUrl } })),
  assign: adminProcedure
    .input(z.object({ technicianId: z.number(), badgeId: z.number() }))
    .mutation(async ({ input }) => db.technicianBadgeAssignment.create({ data: input })),
});
