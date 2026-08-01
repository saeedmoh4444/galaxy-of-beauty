import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const beautyExpensesRouter = router({
  summary: customerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    const [thisMonthBookings, lastMonthBookings, thisYearBookings] = await Promise.all([
      db.booking.findMany({ where: { customerId: userId, createdAt: { gte: thisMonth }, status: 'COMPLETED' }, select: { totalAmount: true, service: { select: { categoryId: true, titleJson: true } } } }),
      db.booking.findMany({ where: { customerId: userId, createdAt: { gte: lastMonth, lt: thisMonth }, status: 'COMPLETED' }, select: { totalAmount: true } }),
      db.booking.findMany({ where: { customerId: userId, createdAt: { gte: thisYear }, status: 'COMPLETED' }, select: { totalAmount: true, createdAt: true, service: { select: { categoryId: true } } } }),
    ]);

    const thisMonthTotal = thisMonthBookings.reduce((s: number, b: any) => s + Number(b.totalAmount || 0), 0);
    const lastMonthTotal = lastMonthBookings.reduce((s: number, b: any) => s + Number(b.totalAmount || 0), 0);
    const thisYearTotal = thisYearBookings.reduce((s: number, b: any) => s + Number(b.totalAmount || 0), 0);

    // Category breakdown for this month
    const byCategory: Record<number, { total: number; count: number; name: string }> = {};
    for (const b of thisMonthBookings) {
      const catId = b.service?.categoryId ?? 0;
      if (!byCategory[catId]) byCategory[catId] = { total: 0, count: 0, name: (b.service?.titleJson as any)?.ar ?? 'أخرى' };
      byCategory[catId]!.total += Number(b.totalAmount || 0);
      byCategory[catId]!.count += 1;
    }

    // Monthly trend (last 6 months)
    const monthlyTrend: Array<{ month: string; total: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthBookings = await db.booking.findMany({ where: { customerId: userId, createdAt: { gte: start, lte: end }, status: 'COMPLETED' }, select: { totalAmount: true } });
      monthlyTrend.push({ month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`, total: monthBookings.reduce((s: number, b: any) => s + Number(b.totalAmount || 0), 0) });
    }

    return {
      thisMonthTotal, lastMonthTotal, thisYearTotal,
      monthOverMonth: lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0,
      totalBookingsThisMonth: thisMonthBookings.length,
      avgPerBooking: thisMonthBookings.length > 0 ? Math.round(thisMonthTotal / thisMonthBookings.length) : 0,
      byCategory: Object.entries(byCategory).map(([catId, data]) => ({ categoryId: Number(catId), ...data })),
      monthlyTrend,
    };
  }),
});
