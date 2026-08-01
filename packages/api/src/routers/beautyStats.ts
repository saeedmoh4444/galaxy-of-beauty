import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

export const beautyStatsRouter = router({
  platform: publicProcedure.query(async () => {
    const [totalBookings, totalServices, totalTechnicians, totalReviews, avgRating] = await Promise.all([
      prisma.booking.count(),
      prisma.service.count({ where: { isActive: true } }),
      prisma.technician.count(),
      prisma.review.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ]);

    return {
      totalBookings,
      totalServices,
      totalTechnicians,
      totalReviews,
      avgRating: Math.round((Number(avgRating._avg?.rating || 0)) * 10) / 10,
      citiesCount: 16,
      happyCustomers: Math.floor(totalBookings * 0.95),
    };
  }),
});
