import { prisma } from '@galaxy/db';
import { SAUDI_CITIES } from '@galaxy/shared';
import { publicProcedure, router } from '../trpc';

/** Estimated satisfaction rate (95%) — replace with real survey data. */
const ESTIMATED_SATISFACTION_RATE = 0.95;

export const beautyStatsRouter = router({
  platform: publicProcedure.query(async () => {
    const [totalBookings, totalServices, totalTechnicians, totalReviews, avgRating] =
      await Promise.all([
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
      avgRating: Math.round(Number(avgRating._avg?.rating || 0) * 10) / 10,
      citiesCount: SAUDI_CITIES.length,
      happyCustomers: Math.floor(totalBookings * ESTIMATED_SATISFACTION_RATE),
    };
  }),
});
