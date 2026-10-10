import { prisma } from '@galaxy/db';
import {
  DISCOVERY_POPULAR_COUNT,
  DISCOVERY_RECOMMEND_COUNT,
  DISCOVERY_EVENTS_COUNT,
  DEFAULT_PAGE_SIZE,
  SMALL_PAGE_SIZE,
} from '@galaxy/shared';
import { publicProcedure, customerProcedure, router } from '../trpc';

const db = prisma;

export const beautyDiscoveryRouter = router({
  // Public: featured content for the discover page
  featured: publicProcedure.query(async () => {
    const [topServices, newServices, upcomingEvents, activeDeals] = await Promise.all([
      db.service.findMany({
        where: { isActive: true, isPopular: true },
        take: DISCOVERY_POPULAR_COUNT,
        select: { id: true, titleJson: true, basePrice: true, imageUrl: true },
      }),
      db.service.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: DISCOVERY_POPULAR_COUNT,
        select: { id: true, titleJson: true, basePrice: true },
      }),
      db.beautyEvent.findMany({
        where: { isPublished: true, startsAt: { gte: new Date() } },
        orderBy: { startsAt: 'asc' },
        take: DISCOVERY_EVENTS_COUNT,
        select: { id: true, nameJson: true, eventType: true, startsAt: true, location: true },
      }),
      db.flashDeal.findMany({
        where: { isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
        take: DISCOVERY_EVENTS_COUNT,
        select: {
          id: true,
          titleAr: true,
          dealPrice: true,
          originalPrice: true,
          discountPercent: true,
          serviceId: true,
        },
      }),
    ]);

    return {
      popularServices: topServices.map((s) => ({
        id: s.id,
        name: (s.titleJson as { ar?: string })?.ar,
        price: Number(s.basePrice),
        emoji: '',
      })),
      newServices: newServices.map((s) => ({
        id: s.id,
        name: (s.titleJson as { ar?: string })?.ar,
        price: Number(s.basePrice),
        emoji: '',
      })),
      events: upcomingEvents.map((e) => ({
        id: e.id,
        name: (e.nameJson as { ar?: string })?.ar,
        type: e.eventType,
        date: e.startsAt,
        location: e.location,
      })),
      flashDeals: activeDeals.map((d) => ({
        id: d.id,
        title: d.titleAr,
        dealPrice: Number(d.dealPrice),
        originalPrice: Number(d.originalPrice),
        discount: d.discountPercent,
        serviceId: d.serviceId,
      })),
    };
  }),

  // Customer: personalized discovery based on preferences
  forYou: customerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [recentBookings, profile, wishlist] = await Promise.all([
      db.booking.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: 'desc' },
        take: DEFAULT_PAGE_SIZE,
        select: { service: { select: { categoryId: true, id: true } } },
      }),
      db.beautyProfile.findUnique({
        where: { userId },
        select: { skinType: true, hairType: true, concerns: true },
      }),
      db.wishlistItem.findMany({
        where: { userId },
        take: SMALL_PAGE_SIZE,
        select: {
          service: {
            select: { id: true, titleJson: true, basePrice: true, categoryId: true },
          },
        },
      }),
    ]);

    // Find preferred categories from booking history
    const catCounts: Record<number, number> = {};
    for (const b of recentBookings) {
      const catId = b.service?.categoryId;
      if (catId) catCounts[catId] = (catCounts[catId] || 0) + 1;
    }

    const topCats = Object.entries(catCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([catId]) => Number(catId));

    // Get recommendations from top categories
    const suggestions =
      topCats.length > 0
        ? await db.service.findMany({
            where: { categoryId: { in: topCats }, isActive: true },
            take: DISCOVERY_RECOMMEND_COUNT,
            select: { id: true, titleJson: true, basePrice: true, categoryId: true },
          })
        : await db.service.findMany({
            where: { isActive: true, isPopular: true },
            take: DISCOVERY_RECOMMEND_COUNT,
            select: { id: true, titleJson: true, basePrice: true, categoryId: true },
          });

    return {
      profile: profile
        ? { skinType: profile.skinType, hairType: profile.hairType, concerns: profile.concerns }
        : null,
      wishlist: wishlist.map((w) => ({
        id: w.service?.id,
        name: (w.service?.titleJson as { ar?: string })?.ar,
        price: Number(w.service?.basePrice || 0),
        emoji: '',
      })),
      suggestions: suggestions.map((s) => ({
        id: s.id,
        name: (s.titleJson as { ar?: string })?.ar,
        price: Number(s.basePrice),
        emoji: '',
        categoryId: s.categoryId,
      })),
    };
  }),
});
