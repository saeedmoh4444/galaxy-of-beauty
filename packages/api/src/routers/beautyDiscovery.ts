import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const beautyDiscoveryRouter = router({
  // Public: featured content for the discover page
  featured: publicProcedure.query(async () => {
    const [topServices, newServices, upcomingEvents, activeDeals] = await Promise.all([
      db.service.findMany({ where: { isActive: true, isPopular: true }, take: 6, select: { id: true, titleJson: true, basePrice: true, imageUrl: true, emoji: true } }),
      db.service.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, titleJson: true, basePrice: true, emoji: true } }),
      db.beautyEvent.findMany({ where: { isPublished: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: 'asc' }, take: 4, select: { id: true, nameJson: true, eventType: true, startsAt: true, location: true } }),
      db.flashDeal.findMany({ where: { isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } }, take: 4, select: { id: true, titleAr: true, dealPrice: true, originalPrice: true, discountPercent: true, serviceId: true } }),
    ]);

    return {
      popularServices: topServices.map((s: any) => ({ id: s.id, name: (s.titleJson as any)?.ar, price: Number(s.basePrice), emoji: s.emoji ?? '💅' })),
      newServices: newServices.map((s: any) => ({ id: s.id, name: (s.titleJson as any)?.ar, price: Number(s.basePrice), emoji: s.emoji ?? '✨' })),
      events: upcomingEvents.map((e: any) => ({ id: e.id, name: (e.nameJson as any)?.ar, type: e.eventType, date: e.startsAt, location: e.location })),
      flashDeals: activeDeals.map((d: any) => ({ id: d.id, title: d.titleAr, dealPrice: Number(d.dealPrice), originalPrice: Number(d.originalPrice), discount: d.discountPercent, serviceId: d.serviceId })),
    };
  }),

  // Customer: personalized discovery based on preferences
  forYou: customerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [recentBookings, profile, wishlist] = await Promise.all([
      db.booking.findMany({ where: { customerId: userId }, orderBy: { createdAt: 'desc' }, take: 10, select: { service: { select: { categoryId: true, id: true } } } }),
      db.beautyProfile.findUnique({ where: { userId }, select: { skinType: true, hairType: true, concerns: true } }),
      db.wishlistItem.findMany({ where: { userId }, take: 5, select: { service: { select: { id: true, titleJson: true, basePrice: true, emoji: true, categoryId: true } } } }),
    ]);

    // Find preferred categories from booking history
    const catCounts: Record<number, number> = {};
    for (const b of recentBookings) {
      const catId = (b as any).service?.categoryId;
      if (catId) catCounts[catId] = (catCounts[catId] || 0) + 1;
    }

    const topCats = Object.entries(catCounts).sort(([,a], [,b]) => b - a).slice(0, 3).map(([catId]) => Number(catId));

    // Get recommendations from top categories
    const suggestions = topCats.length > 0
      ? await db.service.findMany({ where: { categoryId: { in: topCats }, isActive: true }, take: 8, select: { id: true, titleJson: true, basePrice: true, emoji: true, categoryId: true } })
      : await db.service.findMany({ where: { isActive: true, isPopular: true }, take: 8, select: { id: true, titleJson: true, basePrice: true, emoji: true, categoryId: true } });

    return {
      profile: profile ? { skinType: profile.skinType, hairType: profile.hairType, concerns: profile.concerns } : null,
      wishlist: wishlist.map((w: any) => ({ id: w.service?.id, name: (w.service?.titleJson as any)?.ar, price: Number(w.service?.basePrice || 0), emoji: w.service?.emoji ?? '💅' })),
      suggestions: suggestions.map((s: any) => ({ id: s.id, name: (s.titleJson as any)?.ar, price: Number(s.basePrice), emoji: s.emoji ?? '💅', categoryId: s.categoryId })),
    };
  }),
});
