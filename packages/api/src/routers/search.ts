import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

const searchSchema = z.object({
  query: z.string().min(1).max(200),
  locale: z.enum(['ar', 'en']).default('ar'),
  categoryId: z.number().int().positive().optional(),
  city: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'rating', 'popularity']).default('relevance'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

const nearMeSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusKm: z.number().min(1).max(100).default(20),
  serviceId: z.number().int().positive().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export const searchRouter = router({
  search: publicProcedure
    .input(searchSchema)
    .query(async ({ input }) => {
      const { query, locale, categoryId, city, minPrice, maxPrice, sortBy, page, limit } = input;
      const skip = (page - 1) * limit;

      const serviceWhere: Record<string, unknown> = {
        isActive: true,
        OR: [
          { titleJson: { path: [locale], string_contains: query } },
          { descriptionJson: { path: [locale], string_contains: query } },
          { tags: { some: { name: { contains: query, mode: 'insensitive' as const } } } },
        ],
      };

      if (categoryId) serviceWhere['categoryId'] = categoryId;
      if (minPrice !== undefined || maxPrice !== undefined) {
        const pf: Record<string, number> = {};
        if (minPrice !== undefined) pf['gte'] = minPrice;
        if (maxPrice !== undefined) pf['lte'] = maxPrice;
        serviceWhere['basePrice'] = pf;
      }

      let orderBy: Record<string, string> = { createdAt: 'desc' };
      switch (sortBy) {
        case 'price_asc':  orderBy = { basePrice: 'asc' }; break;
        case 'price_desc': orderBy = { basePrice: 'desc' }; break;
        default: orderBy = { createdAt: 'desc' };
      }

      const [services, serviceTotal] = await Promise.all([
        prisma.service.findMany({
          where: serviceWhere as never,
          include: { category: { select: { id: true, nameJson: true } } },
          orderBy: orderBy as never,
          skip, take: limit,
        }),
        prisma.service.count({ where: serviceWhere as never }),
      ]);

      const techWhere: Record<string, unknown> = {
        user: { isActive: true, role: 'TECHNICIAN' },
        kycStatus: 'VERIFIED',
        OR: [{ user: { name: { contains: query, mode: 'insensitive' as const } } }],
      };
      if (city) techWhere['city'] = { contains: city, mode: 'insensitive' as const };

      const [technicians, techTotal] = await Promise.all([
        prisma.technician.findMany({
          where: techWhere as never,
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          skip, take: limit,
        }),
        prisma.technician.count({ where: techWhere as never }),
      ]);

      return {
        services: { items: services, total: serviceTotal, hasMore: skip + services.length < serviceTotal },
        technicians: { items: technicians, total: techTotal, hasMore: skip + technicians.length < techTotal },
        query, locale, page, limit,
      };
    }),

  nearMe: publicProcedure
    .input(nearMeSchema)
    .query(async ({ input }) => {
      const { latitude, longitude, radiusKm, serviceId, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        user: { isActive: true },
        kycStatus: 'VERIFIED',
      };
      if (serviceId) where['technicianServices'] = { some: { serviceId } };

      const technicians = await prisma.technician.findMany({
        where: where as never,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        skip, take: limit,
      });

      const itemsWithDistance = technicians.map((t) => {
        const tLat = (t as Record<string, unknown>).latitude as number | null;
        const tLng = (t as Record<string, unknown>).longitude as number | null;
        let distanceKm: number | null = null;
        if (tLat !== null && tLng !== null) {
          distanceKm = haversineDistance(latitude, longitude, tLat, tLng);
        }
        return { ...t, distanceKm };
      });

      const filtered = radiusKm
        ? itemsWithDistance.filter((t) => t.distanceKm !== null && t.distanceKm <= radiusKm)
        : itemsWithDistance;
      filtered.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

      return {
        items: filtered.slice(0, limit),
        total: filtered.length,
        hasMore: skip + limit < filtered.length,
        page, limit, center: { latitude, longitude }, radiusKm,
      };
    }),

  suggestions: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100), locale: z.enum(['ar', 'en']).default('ar') }))
    .query(async ({ input }) => {
      const { query, locale } = input;
      const [services, technicians] = await Promise.all([
        prisma.service.findMany({
          where: { isActive: true, titleJson: { path: [locale], string_contains: query } },
          select: { id: true, titleJson: true },
          take: 5,
        }),
        prisma.user.findMany({
          where: { role: 'TECHNICIAN', isActive: true, name: { contains: query, mode: 'insensitive' as const } },
          select: { id: true, name: true, avatarUrl: true },
          take: 3,
        }),
      ]);

      return {
        services: services.map((s) => ({ id: s.id, title: (s.titleJson as Record<string, string>)[locale] || '' })),
        technicians: technicians.map((t) => ({ id: t.id, name: t.name, avatarUrl: t.avatarUrl })),
      };
    }),
});

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number { return deg * (Math.PI / 180); }
