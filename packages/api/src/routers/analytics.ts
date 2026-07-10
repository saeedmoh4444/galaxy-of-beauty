import { z } from 'zod';
import { adminProcedure, technicianProcedure, customerProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';

export const analyticsRouter = router({
  revenueChart: adminProcedure
    .input(
      z
        .object({ days: z.number().optional().default(30) })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const payments = await prisma.payment.findMany({
        where: {
          status: 'CAPTURED',
          createdAt: { gte: since },
        },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      // Group by date
      const dailyMap = new Map<string, number>();
      for (let i = 0; i < input.days; i++) {
        const d = new Date(since);
        d.setDate(d.getDate() + i);
        dailyMap.set(d.toISOString().slice(0, 10), 0);
      }

      for (const p of payments) {
        const key = p.createdAt.toISOString().slice(0, 10);
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + p.amount.toNumber());
      }

      const dailyRevenue = Array.from(dailyMap.entries()).map(
        ([date, revenue]) => ({ date, revenue }),
      );

      return {
        dailyRevenue,
        totalRevenue: payments.reduce(
          (sum, p) => sum + p.amount.toNumber(),
          0,
        ),
        period: {
          start: since.toISOString(),
          end: new Date().toISOString(),
          days: input.days,
        },
      };
    }),

  bookingStats: adminProcedure.query(async () => {
    const [total, byStatus, completed, cancelled] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({
        where: {
          OR: [
            { status: 'CANCELLED' },
            { status: 'REJECTED' },
            { status: 'NO_SHOW' },
          ],
        },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((b) => ({
        status: b.status,
        count: b._count,
      })),
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
    };
  }),

  topTechnicians: adminProcedure
    .input(
      z
        .object({ limit: z.number().optional().default(10) })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const technicians = await prisma.technician.findMany({
        take: input.limit,
        orderBy: [{ completedBookings: 'desc' }, { ratingAvg: 'desc' }],
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      return technicians.map((t) => ({
        id: t.id,
        userId: t.userId,
        name: t.user.name,
        email: t.user.email,
        avatarUrl: t.user.avatarUrl,
        city: t.city,
        completedBookings: t.completedBookings,
        ratingAvg: t.ratingAvg.toNumber(),
        totalReviews: t.totalReviews,
        hourlyRate: t.hourlyRate.toNumber(),
        isEcoFriendly: t.isEcoFriendly,
      }));
    }),

  topServices: adminProcedure
    .input(
      z
        .object({ limit: z.number().optional().default(10) })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const bookings = await prisma.booking.groupBy({
        by: ['serviceId'],
        _count: true,
        orderBy: { _count: { serviceId: 'desc' } },
        take: input.limit,
      });

      if (bookings.length === 0) return [];

      const serviceIds = bookings.map((b) => b.serviceId);
      const services = await prisma.service.findMany({
        where: { id: { in: serviceIds } },
        select: {
          id: true,
          titleJson: true,
          basePrice: true,
          category: { select: { nameJson: true } },
        },
      });

      const serviceMap = new Map(services.map((s) => [s.id, s]));

      return bookings.map((b) => {
        const svc = serviceMap.get(b.serviceId);
        return {
          serviceId: b.serviceId,
          titleJson: svc?.titleJson ?? null,
          basePrice: svc?.basePrice.toNumber() ?? 0,
          categoryNameJson: svc?.category.nameJson ?? null,
          bookingCount: b._count,
        };
      });
    }),

  userGrowth: adminProcedure
    .input(
      z
        .object({ days: z.number().optional().default(30) })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const users = await prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, role: true },
        orderBy: { createdAt: 'asc' },
      });

      const dailyMap = new Map<
        string,
        { total: number; customers: number; technicians: number; admins: number }
      >();

      for (let i = 0; i < input.days; i++) {
        const d = new Date(since);
        d.setDate(d.getDate() + i);
        dailyMap.set(d.toISOString().slice(0, 10), {
          total: 0,
          customers: 0,
          technicians: 0,
          admins: 0,
        });
      }

      for (const u of users) {
        const key = u.createdAt.toISOString().slice(0, 10);
        const entry = dailyMap.get(key);
        if (entry) {
          entry.total++;
          if (u.role === 'CUSTOMER') entry.customers++;
          else if (u.role === 'TECHNICIAN') entry.technicians++;
          else if (u.role === 'ADMIN') entry.admins++;
        }
      }

      const dailyGrowth = Array.from(dailyMap.entries()).map(
        ([date, counts]) => ({
          date,
          ...counts,
        }),
      );

      return {
        dailyGrowth,
        totalNewUsers: users.length,
        period: {
          start: since.toISOString(),
          end: new Date().toISOString(),
          days: input.days,
        },
      };
    }),

  technicianEarnings: technicianProcedure
    .input(
      z
        .object({ days: z.number().optional().default(30) })
        .optional()
        .default({}),
    )
    .query(async ({ input, ctx }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const bookings = await prisma.booking.findMany({
        where: {
          technicianId: ctx.user.id,
          status: 'COMPLETED',
          createdAt: { gte: since },
        },
        select: { totalAmount: true, platformFee: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const dailyMap = new Map<string, { earnings: number; count: number }>();
      for (let i = 0; i < input.days; i++) {
        const d = new Date(since);
        d.setDate(d.getDate() + i);
        dailyMap.set(d.toISOString().slice(0, 10), { earnings: 0, count: 0 });
      }

      for (const b of bookings) {
        const key = b.createdAt.toISOString().slice(0, 10);
        const entry = dailyMap.get(key);
        if (entry) {
          entry.earnings +=
            b.totalAmount.toNumber() - b.platformFee.toNumber();
          entry.count++;
        }
      }

      const dailyEarnings = Array.from(dailyMap.entries()).map(
        ([date, data]) => ({
          date,
          ...data,
        }),
      );

      return {
        dailyEarnings,
        totalEarnings: bookings.reduce(
          (sum, b) =>
            sum + (b.totalAmount.toNumber() - b.platformFee.toNumber()),
          0,
        ),
        totalBookings: bookings.length,
        period: { start: since.toISOString(), end: new Date().toISOString(), days: input.days },
      };
    }),

  customerInsights: customerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [payments, bookings, streak] = await Promise.all([
      prisma.payment.findMany({
        where: {
          booking: { customerId: userId },
          status: 'CAPTURED',
        },
        select: { amount: true },
      }),
      prisma.booking.findMany({
        where: { customerId: userId },
        select: { status: true, service: { select: { categoryId: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.streak.findUnique({ where: { customerId: userId } }),
    ]);

    // Find favorite category
    const categoryCount = new Map<number, number>();
    for (const b of bookings) {
      if (b.service?.categoryId) {
        categoryCount.set(
          b.service.categoryId,
          (categoryCount.get(b.service.categoryId) ?? 0) + 1,
        );
      }
    }

    let favoriteCategory: number | null = null;
    let maxCount = 0;
    for (const [catId, count] of categoryCount) {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = catId;
      }
    }

    // Get category name if we have a favorite
    let favoriteCategoryName = null;
    if (favoriteCategory) {
      const cat = await prisma.category.findUnique({
        where: { id: favoriteCategory },
        select: { nameJson: true },
      });
      favoriteCategoryName = cat?.nameJson ?? null;
    }

    return {
      totalSpent: payments.reduce((sum, p) => sum + p.amount.toNumber(), 0),
      bookingCount: bookings.length,
      completedBookings: bookings.filter((b) => b.status === 'COMPLETED').length,
      favoriteCategory: favoriteCategoryName,
      streakInfo: streak
        ? {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            lastBookingDate: streak.lastBookingDate,
          }
        : null,
    };
  }),
});
