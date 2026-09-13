import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { adminProcedure, technicianProcedure, router } from '../trpc';

export const technicianPerformanceRouter = router({
  myStats: technicianProcedure.query(async ({ ctx }) => {
    const tech = await prisma.technician.findUnique({ where: { userId: ctx.user.id } });
    if (!tech) return null;
    const [totalBookings, completedBookings, cancelledBookings] = await Promise.all([
      prisma.booking.count({ where: { technicianId: ctx.user.id } }),
      prisma.booking.count({ where: { technicianId: ctx.user.id, status: 'COMPLETED' } }),
      prisma.booking.count({ where: { technicianId: ctx.user.id, status: 'CANCELLED' } }),
    ]);
    return {
      totalBookings,
      completedBookings,
      cancelRate: totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0,
      rating: tech.ratingAvg,
    };
  }),

  leaderboard: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        sortBy: z.enum(['bookings', 'rating', 'earnings']).default('bookings'),
      }),
    )
    .query(async ({ input }) => {
      return prisma.technician.findMany({
        where: { kycStatus: 'VERIFIED' },
        orderBy: input.sortBy === 'rating' ? { ratingAvg: 'desc' } : { completedBookings: 'desc' },
        take: input.limit,
        select: {
          userId: true,
          ratingAvg: true,
          completedBookings: true,
          user: { select: { name: true } },
        },
      });
    }),
});
