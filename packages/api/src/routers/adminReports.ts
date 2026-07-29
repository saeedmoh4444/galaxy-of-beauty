import { adminProcedure, router } from '../trpc';

const REPORTS = {
  revenue: { labels: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو'], data: [320000,345000,380000,410000,395000,430000,450000] },
  bookings: { labels: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو'], data: [1100,1180,1350,1420,1380,1500,1550] },
  topTechs: [
    { name: 'نورة العمري', revenue: 96000, bookings: 320, rating: 4.9 },
    { name: 'سارة الحربي', revenue: 82000, bookings: 280, rating: 4.8 },
    { name: 'د. ليلى القحطاني', revenue: 75000, bookings: 250, rating: 4.9 },
    { name: 'هند المطيري', revenue: 58000, bookings: 220, rating: 4.7 },
    { name: 'مريم الشمري', revenue: 45000, bookings: 180, rating: 4.6 },
  ],
  byService: [
    { name: 'مكياج', revenue: 96000, bookings: 320, pct: 22 },
    { name: 'تنظيف بشرة', revenue: 56000, bookings: 280, pct: 15 },
    { name: 'مساج', revenue: 62500, bookings: 250, pct: 14 },
    { name: 'مانيكير', revenue: 33000, bookings: 220, pct: 10 },
    { name: 'تسريحة شعر', revenue: 45000, bookings: 180, pct: 8 },
  ],
  byCity: [
    { city: 'الرياض', bookings: 680, revenue: 210000 },
    { city: 'جدة', bookings: 420, revenue: 130000 },
    { city: 'الدمام', bookings: 280, revenue: 85000 },
    { city: 'مكة المكرمة', bookings: 200, revenue: 62000 },
    { city: 'المدينة المنورة', bookings: 150, revenue: 45000 },
  ],
};

function generateCSV(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const header = columns.join(',');
  const body = rows.map((r) => columns.map((c) => `"${String(r[c] ?? '')}"`).join(',')).join('\n');
  return `${header}\n${body}`;
}

export const adminReportsRouter = router({
  dashboard: adminProcedure.query(() => REPORTS),
  exportCSV: adminProcedure.query(() => ({
    topTechs: generateCSV(REPORTS.topTechs as unknown as Array<Record<string, unknown>>, ['name', 'revenue', 'bookings', 'rating']),
    byService: generateCSV(REPORTS.byService as unknown as Array<Record<string, unknown>>, ['name', 'revenue', 'bookings', 'pct']),
    byCity: generateCSV(REPORTS.byCity as unknown as Array<Record<string, unknown>>, ['city', 'bookings', 'revenue']),
  })),
  pdfReport: adminProcedure.query(() => ({
    title: 'تقرير جالكسي بيوتي — يوليو ٢٠٢٦',
    generatedAt: new Date().toISOString(),
    summary: { totalRevenue: '٤٥٠,٠٠٠ ر.س', totalBookings: '١,٥٥٠ حجز', activeTechs: 520, customers: '٢٨,٥٠٠ مستخدمة', avgRating: 4.7 },
    sections: ['📊 الإيرادات', '📅 الحجوزات', '👩‍🎨 الفنيات', '💄 الخدمات', '📍 المدن'],
  })),
});
