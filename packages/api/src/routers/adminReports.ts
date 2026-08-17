import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE } from '@galaxy/shared';
import { adminProcedure, router } from '../trpc';

const db = prisma;

function generateCSV(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const header = columns.join(',');
  const body = rows.map((r) => columns.map((c) => `"${String(r[c] ?? '')}"`).join(',')).join('\n');
  return `${header}\n${body}`;
}

export const adminReportsRouter = router({
  dashboard: adminProcedure.query(async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthBookings, monthRevenue, topServices, topTechnicians] = await Promise.all([
      db.booking.count({ where: { createdAt: { gte: monthStart } } }),
      db.booking.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
      }),
      db.category.findMany({
        take: SMALL_PAGE_SIZE,
        include: {
          _count: { select: { services: true } },
          services: { include: { bookings: { select: { totalAmount: true } } } },
        },
      }),
      db.booking.groupBy({
        by: ['technicianId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: SMALL_PAGE_SIZE,
      }),
    ]);

    const byService = (topServices as any[])
      .map((c: any) => {
        const bookings = c.services.reduce(
          (s: number, svc: any) => s + (svc.bookings?.length || 0),
          0,
        );
        const revenue = c.services.reduce(
          (s: number, svc: any) =>
            s +
            (svc.bookings as any[]).reduce(
              (bs: number, b: any) => bs + Number(b.totalAmount || 0),
              0,
            ),
          0,
        );
        return {
          name: (c.nameJson as Record<string, string>)?.ar ?? '',
          revenue,
          bookings,
          pct: 0,
        };
      })
      .sort((a: any, b: any) => b.bookings - a.bookings);

    const topTechs = (topTechnicians as any[])
      .map((t: any) => ({
        name: `فنية #${t.technicianId}`,
        revenue: 0,
        bookings: t._count?.id || 0,
        rating: 0,
      }))
      .sort((a: any, b: any) => b.bookings - a.bookings);

    const totalBookings = byService.reduce((s, b) => s + b.bookings, 0);
    if (totalBookings > 0)
      byService.forEach((s: any) => {
        s.pct = Math.round((s.bookings / totalBookings) * 100);
      });

    return {
      revenue: { labels: [''], data: [Number(monthRevenue._sum?.totalAmount || 0)] },
      bookings: { labels: [''], data: [monthBookings] },
      topTechs,
      byService,
      byCity: [],
    };
  }),

  exportCSV: adminProcedure.query(async () => {
    const dashboard = await (async () => {
      const topServices = await db.category.findMany({
        take: SMALL_PAGE_SIZE,
        include: { services: { include: { bookings: { select: { totalAmount: true } } } } },
      });
      return (topServices as any[]).map((c: any) => {
        const bookings = c.services.reduce(
          (s: number, svc: any) => s + (svc.bookings?.length || 0),
          0,
        );
        const revenue = c.services.reduce(
          (s: number, svc: any) =>
            s +
            (svc.bookings as any[]).reduce(
              (bs: number, b: any) => bs + Number(b.totalAmount || 0),
              0,
            ),
          0,
        );
        return {
          name: (c.nameJson as Record<string, string>)?.ar ?? '',
          revenue,
          bookings,
          pct: 0,
        };
      });
    })();

    return {
      topTechs: generateCSV([], ['name', 'revenue', 'bookings', 'rating']),
      byService: generateCSV(dashboard as unknown as Array<Record<string, unknown>>, [
        'name',
        'revenue',
        'bookings',
        'pct',
      ]),
      byCity: generateCSV([], ['city', 'bookings', 'revenue']),
    };
  }),

  pdfReport: adminProcedure.query(async () => {
    const [bookings, revenue] = await Promise.all([
      db.booking.count(),
      db.booking.aggregate({ _sum: { totalAmount: true } }),
    ]);
    return {
      title: 'تقرير جالكسي بيوتي',
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: Number(revenue._sum?.totalAmount || 0),
        totalBookings: bookings,
        activeTechs: 0,
        customers: 0,
        avgRating: 0,
      },
      sections: [' الإيرادات', ' الحجوزات', '‍ الفنيات', ' الخدمات', ' المدن'],
    };
  }),
});
