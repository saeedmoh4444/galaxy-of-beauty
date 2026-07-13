import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { technicianProcedure, adminProcedure, router } from '../trpc';

export const performanceRouter = router({
  myDashboard: technicianProcedure.query(async ({ ctx }) => {
    const [totalBookings, completedBookings, reviews, earnings] = await Promise.all([
      prisma.booking.count({ where: { technicianId: ctx.user.id } }),
      prisma.booking.count({ where: { technicianId: ctx.user.id, status: 'COMPLETED' } }),
      prisma.review.aggregate({ where: { booking: { technicianId: ctx.user.id } }, _avg: { rating: true }, _count: true }),
      prisma.booking.aggregate({
        where: { technicianId: ctx.user.id, status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
    ]);

    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

    // Monthly earnings trend (last 6 months)
    const now = new Date();
    const monthlyEarnings: Array<{ month: string; total: number; count: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const agg = await prisma.booking.aggregate({
        where: { technicianId: ctx.user.id, status: 'COMPLETED', updatedAt: { gte: start, lte: end } },
        _sum: { totalAmount: true },
        _count: true,
      });
      monthlyEarnings.push({
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        total: Number(agg._sum?.totalAmount || 0),
        count: agg._count,
      });
    }

    return {
      totalBookings, completedBookings, completionRate,
      avgRating: Math.round((Number(reviews._avg?.rating || 0)) * 10) / 10,
      totalReviews: reviews._count,
      totalEarnings: Number(earnings._sum?.totalAmount || 0),
      monthlyEarnings,
    };
  }),

  leaderboard: adminProcedure
    .input(z.object({ limit: z.number().default(10), sortBy: z.enum(['bookings', 'earnings', 'rating']).default('bookings') }))
    .query(async ({ input }) => {
      const techs = await prisma.technician.findMany({
        where: { kycStatus: 'VERIFIED', user: { isActive: true } },
        include: { user: { select: { name: true, avatarUrl: true } } },
        take: input.limit,
      });

      const rows: Array<{ name: string; bookings: number; reviews: number; rating: number }> = [];
      for (const t of techs) {
        const [bkCount, revAgg] = await Promise.all([
          prisma.booking.count({ where: { technicianId: t.userId } }),
          prisma.review.aggregate({ where: { booking: { technicianId: t.userId } }, _avg: { rating: true } }),
        ]);
        rows.push({
          name: t.user.name,
          bookings: bkCount,
          reviews: await prisma.review.count({ where: { booking: { technicianId: t.userId } } }),
          rating: Math.round((Number(revAgg._avg?.rating || 0)) * 10) / 10,
        });
      }

      if (input.sortBy === 'bookings') rows.sort((a, b) => b.bookings - a.bookings);
      else if (input.sortBy === 'rating') rows.sort((a, b) => b.rating - a.rating);
      else rows.sort((a, b) => b.reviews - a.reviews);

      return rows.slice(0, input.limit);
    }),
});
