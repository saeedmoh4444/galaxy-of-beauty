import { prisma } from '@galaxy/db';
import { adminProcedure, router } from '../trpc';

function generateCSV(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const header = columns.join(',');
  const body = rows.map((r) => columns.map((c) => `"${String(r[c] ?? '')}"`).join(',')).join('\n');
  return `${header}\n${body}`;
}

export const adminReportsRouter = router({
  dashboard: adminProcedure.query(async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [
      monthBookings, monthRevenue,
      topServices, topTechnicians,
    ] = await Promise.all([
      prisma.booking.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.booking.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { totalAmount: true } }),
      prisma.category.findMany({ take: 5, include: { _count: { select: { services: true } }, services: { include: { bookings: { select: { totalAmount: true } } } } } }),
      prisma.technician.findMany({ take: 5, include: { _count: { select: { bookings: true } } } }),
    ]);

    const byService = topServices.map(c => {
      const bookings = c.services.reduce((s, svc) => s + svc.bookings.length, 0);
      const revenue = c.services.reduce((s, svc) => s + svc.bookings.reduce((bs, b) => bs + Number(b.totalAmount || 0), 0), 0);
      return { name: (c.nameJson as Record<string, string>)?.ar ?? '', revenue, bookings, pct: 0 };
    }).sort((a, b) => b.bookings - a.bookings);

    const topTechs = topTechnicians.map(t => ({
      name: `فنية #${t.id}`,
      revenue: 0,
      bookings: t._count.bookings,
      rating: 0,
    })).sort((a, b) => b.bookings - a.bookings);

    const totalBookings = byService.reduce((s, b) => s + b.bookings, 0);
    if (totalBookings > 0) byService.forEach(s => { s.pct = Math.round((s.bookings / totalBookings) * 100); });

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
      const topServices = await prisma.category.findMany({ take: 5, include: { services: { include: { bookings: { select: { totalAmount: true } } } } } });
      return topServices.map(c => {
        const bookings = c.services.reduce((s, svc) => s + svc.bookings.length, 0);
        const revenue = c.services.reduce((s, svc) => s + svc.bookings.reduce((bs, b) => bs + Number(b.totalAmount || 0), 0), 0);
        return { name: (c.nameJson as Record<string, string>)?.ar ?? '', revenue, bookings, pct: 0 };
      });
    })();

    return {
      topTechs: generateCSV([], ['name', 'revenue', 'bookings', 'rating']),
      byService: generateCSV(dashboard as unknown as Array<Record<string, unknown>>, ['name', 'revenue', 'bookings', 'pct']),
      byCity: generateCSV([], ['city', 'bookings', 'revenue']),
    };
  }),

  pdfReport: adminProcedure.query(async () => {
    const [bookings, revenue] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.aggregate({ _sum: { totalAmount: true } }),
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
      sections: ['📊 الإيرادات', '📅 الحجوزات', '👩‍🎨 الفنيات', '💄 الخدمات', '📍 المدن'],
    };
  }),
});
