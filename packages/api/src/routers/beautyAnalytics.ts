import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE } from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

const db = prisma;

export const beautyAnalyticsRouter = router({
  summary: customerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [totalBookings, completedBookings, totalSpent, walletTx] = await Promise.all([
      db.booking.count({ where: { customerId: userId } }),
      db.booking.count({ where: { customerId: userId, status: 'COMPLETED' } }),
      db.payment.aggregate({
        where: { booking: { customerId: userId }, status: 'CAPTURED' },
        _sum: { amount: true },
      }),
      db.walletTransaction.findMany({
        where: { wallet: { userId }, type: 'CREDIT' },
        orderBy: { createdAt: 'desc' },
        take: SMALL_PAGE_SIZE,
      }),
    ]);

    return {
      totalBookings,
      completedBookings,
      completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
      totalSpent: Number(totalSpent?._sum?.amount ?? 0),
      recentCredits: (walletTx as any[]).map((t: any) => ({
        amount: Number(t.amount),
        source: t.source,
        date: t.createdAt,
      })),
    };
  }),

  byCategory: customerProcedure.query(async ({ ctx }) => {
    const bookings = await db.booking.findMany({
      where: { customerId: ctx.user.id, status: 'COMPLETED' },
      include: { service: { include: { category: { select: { nameJson: true } } } } },
    });

    const categoryMap = new Map<string, { count: number; spent: number }>();
    (bookings as any[]).forEach((b: any) => {
      const catName = (b.service?.category?.nameJson as Record<string, string>)?.ar ?? 'أخرى';
      const prev = categoryMap.get(catName) || { count: 0, spent: 0 };
      categoryMap.set(catName, {
        count: prev.count + 1,
        spent: prev.spent + Number(b.totalAmount || 0),
      });
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      spent: data.spent,
      pct: bookings.length > 0 ? Math.round((data.count / bookings.length) * 100) : 0,
    }));
  }),

  monthlyTrend: customerProcedure.query(async ({ ctx }) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const bookings = await db.booking.findMany({
      where: { customerId: ctx.user.id, createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyMap = new Map<string, number>();
    (bookings as any[]).forEach((b: any) => {
      const month = new Date(b.createdAt).toLocaleDateString('ar-SA', {
        month: 'short',
        year: 'numeric',
      });
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
    });

    return Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count }));
  }),
});
