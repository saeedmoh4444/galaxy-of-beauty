import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const beautyEventRouter = router({
  upcoming: publicProcedure.query(async () => db.beautyEvent.findMany({ where: { isPublished: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: 'asc' }, take: 10 })),
  listAll: adminProcedure.query(async () => db.beautyEvent.findMany({ orderBy: { startsAt: 'desc' } })),
  create: adminProcedure
    .input(z.object({ nameAr: z.string(), nameEn: z.string(), descriptionAr: z.string().optional(), descriptionEn: z.string().optional(), eventType: z.enum(['workshop', 'masterclass', 'launch', 'seasonal']), location: z.string().optional(), price: z.number().optional(), maxAttendees: z.number().optional(), startsAt: z.string().datetime(), endsAt: z.string().datetime(), imageUrl: z.string().optional(), isPublished: z.boolean().default(false) }))
    .mutation(async ({ input }) => db.beautyEvent.create({ data: { nameJson: { ar: input.nameAr, en: input.nameEn }, descriptionJson: input.descriptionAr ? { ar: input.descriptionAr, en: input.descriptionEn } : undefined, eventType: input.eventType, location: input.location, price: input.price, maxAttendees: input.maxAttendees, startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt), imageUrl: input.imageUrl, isPublished: input.isPublished } })),
});
