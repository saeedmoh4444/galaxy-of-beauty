import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const recommendationsRouter = router({
  // "Frequently booked together" — services often booked with this one
  frequentlyBookedTogether: publicProcedure
    .input(z.object({ serviceId: z.number().int().positive(), limit: z.number().default(4) }))
    .query(async ({ input }) => {
      // Find bookings that include this service, then find other services in those bookings
      const bookings = await db.booking.findMany({
        where: { serviceId: input.serviceId },
        select: { customerId: true },
        take: 100,
      });
      const customerIds = bookings.map((b: any) => b.customerId);
      if (customerIds.length === 0) return [];

      const related = await db.booking.groupBy({
        by: ['serviceId'],
        where: { customerId: { in: customerIds }, serviceId: { not: input.serviceId } },
        _count: { serviceId: true },
        orderBy: { _count: { serviceId: 'desc' } },
        take: input.limit,
      });

      const serviceIds = related.map((r: any) => r.serviceId);
      const services = await db.service.findMany({ where: { id: { in: serviceIds }, isActive: true } });
      return services.map((s: any) => ({ id: s.id, title: (s.titleJson as any)?.ar || '', basePrice: Number(s.basePrice), durationMin: s.durationMin, bookedTogether: related.find((r: any) => r.serviceId === s.id)?._count?.serviceId || 0 }));
    }),

  // "Complete the look" — complementary services based on category
  completeTheLook: publicProcedure
    .input(z.object({ serviceId: z.number().int().positive(), limit: z.number().default(4) }))
    .query(async ({ input }) => {
      const service = await db.service.findUnique({ where: { id: input.serviceId } });
      if (!service) return [];

      const categoryId = service.categoryId;
      const sameCategory = await db.service.findMany({ where: { categoryId, id: { not: input.serviceId }, isActive: true }, take: input.limit });
      if (sameCategory.length >= input.limit) return sameCategory.map((s: any) => ({ id: s.id, title: (s.titleJson as any)?.ar || '', basePrice: Number(s.basePrice), durationMin: s.durationMin, reason: 'same_category' }));

      const otherServices = await db.service.findMany({ where: { id: { not: input.serviceId }, isActive: true, isPopular: true }, take: input.limit });
      return otherServices.map((s: any) => ({ id: s.id, title: (s.titleJson as any)?.ar || '', basePrice: Number(s.basePrice), durationMin: s.durationMin, reason: 'popular' }));
    }),

  // "Because you viewed" — based on beauty profile
  forYou: publicProcedure
    .input(z.object({ skinType: z.string().optional(), hairType: z.string().optional(), limit: z.number().default(4) }))
    .query(async ({ input }) => {
      const services = await db.service.findMany({ where: { isActive: true }, take: input.limit * 2 });
      return services.slice(0, input.limit).map((s: any) => ({ id: s.id, title: (s.titleJson as any)?.ar || '', basePrice: Number(s.basePrice), durationMin: s.durationMin }));
    }),
});
