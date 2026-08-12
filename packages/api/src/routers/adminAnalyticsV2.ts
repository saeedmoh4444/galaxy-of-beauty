import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE, MS_PER_WEEK, MS_PER_30_DAYS } from '@galaxy/shared';
import { adminProcedure, router } from '../trpc';

export const adminAnalyticsV2Router = router({
  dashboard: adminProcedure.query(async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - MS_PER_WEEK);
    const monthAgo = new Date(today.getTime() - MS_PER_30_DAYS);

    const [
      totalUsers,
      totalTechnicians,
      totalBookings,
      bookingsToday,
      bookingsWeek,
      bookingsMonth,
      revenueToday,
      revenueWeek,
      revenueMonth,
      completedBookings,
      topCategories,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.technician.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: today } } }),
      prisma.booking.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.booking.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.booking.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: { createdAt: { gte: weekAgo } },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: { createdAt: { gte: monthAgo } },
        _sum: { totalAmount: true },
      }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.category.findMany({
        take: SMALL_PAGE_SIZE,
        include: {
          _count: { select: { services: true } },
          services: { select: { bookings: true } },
        },
      }),
    ]);

    const completionRate =
      totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

    const topServices = topCategories
      .map((c) => ({
        name: (c.nameJson as Record<string, string>)?.ar ?? '',
        bookings: c.services.reduce((s, svc) => s + svc.bookings.length, 0),
        revenue: c.services.reduce(
          (s, svc) => s + svc.bookings.reduce((bs, b) => bs + Number(b.totalAmount || 0), 0),
          0,
        ),
        growth: 0,
      }))
      .sort((a, b) => b.bookings - a.bookings);

    return {
      revenue: {
        today: Number(revenueToday._sum?.totalAmount || 0),
        week: Number(revenueWeek._sum?.totalAmount || 0),
        month: Number(revenueMonth._sum?.totalAmount || 0),
        growth: 0,
        chart: [],
      },
      bookings: {
        today: bookingsToday,
        week: bookingsWeek,
        month: bookingsMonth,
        completionRate,
        chart: [],
      },
      users: { total: totalUsers, newToday: 0, activeToday: 0, retentionRate: 0 },
      technicians: { total: totalTechnicians, active: 0, newThisMonth: 0, avgRating: 0 },
      topServices,
      forecast: { nextMonthRevenue: 0, nextMonthBookings: 0, confidence: 0 },
    };
  }),

  daily: adminProcedure.query(async () => {
    const labels = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
    return { labels, revenue: labels.map(() => 0), bookings: labels.map(() => 0) };
  }),

  forecast: adminProcedure.query(() => ({
    nextMonthRevenue: 0,
    nextMonthBookings: 0,
    confidence: 0,
  })),
});
