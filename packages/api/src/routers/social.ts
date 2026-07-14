import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const socialRouter = router({
  // ── Trending Services ─────────────────────────────────
  trending: publicProcedure.query(async () => {
    const topServices = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: { status: 'COMPLETED', createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const serviceIds = topServices.map((s) => s.serviceId);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, titleJson: true, basePrice: true, imageUrl: true },
    });

    return topServices.map((s) => ({
      ...services.find((svc) => svc.id === s.serviceId),
      bookingCount: s._count.id,
    }));
  }),

  // ── Technician Spotlight ────────────────────────────────
  spotlight: publicProcedure.query(async () => {
    const topTechs = await prisma.review.groupBy({
      by: ['id'],
      _avg: { rating: true },
      _count: { id: true },
      orderBy: { _avg: { rating: 'desc' } },
      take: 5,
    });

    // Get actual technicians from reviews
    const techIds = topTechs.map((t) => t.id);
    const techs = await prisma.technician.findMany({
      where: { userId: { in: techIds } },
      include: { user: { select: { name: true, avatarUrl: true } } },
      take: 5,
    });

    return techs.map((t) => ({
      id: t.userId, name: t.user.name, avatarUrl: t.user.avatarUrl,
      city: t.city, ratingAvg: Number(t.ratingAvg),
    }));
  }),

  // ── Beauty Tips Blog ───────────────────────────────────
  tips: publicProcedure
    .input(z.object({ page: z.number().default(1), category: z.string().optional() }))
    .query(async ({ input }) => {
      // Tips stored as platform configs with key prefix "tip:"
      const tips = await prisma.platformConfig.findMany({
        where: { key: { startsWith: 'tip:' } },
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * 10,
        take: 10,
      });

      return tips.map((t) => {
        const parsed = JSON.parse(t.value);
        return { id: t.key.replace('tip:', ''), ...parsed, createdAt: t.createdAt };
      });
    }),

  createTip: adminProcedure
    .input(z.object({ titleAr: z.string(), titleEn: z.string(), bodyAr: z.string(), bodyEn: z.string(), category: z.string(), imageUrl: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const id = `tip:${Date.now()}`;
      await prisma.platformConfig.create({
        data: { key: id, value: JSON.stringify(input), updatedBy: ctx.user.id },
      });
      return { id, success: true };
    }),

  // ── Seasonal Lookbook ──────────────────────────────────
  lookbook: publicProcedure.query(async () => {
    const items = await prisma.platformConfig.findMany({
      where: { key: { startsWith: 'lookbook:' } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    return items.map((l) => {
      const parsed = JSON.parse(l.value);
      return { id: l.key.replace('lookbook:', ''), ...parsed };
    });
  }),

  // ── Before/After Feed ──────────────────────────────────
  feed: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.galleryImage.findMany({
          where: { isPublished: true },
          include: { technician: { select: { city: true, user: { select: { name: true } } } } },
          orderBy: { createdAt: 'desc' },
          skip, take: input.limit,
        }),
        prisma.galleryImage.count({ where: { isPublished: true } }),
      ]);
      return { items, total, page: input.page };
    }),
});
