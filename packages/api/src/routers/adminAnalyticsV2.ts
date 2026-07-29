import { adminProcedure, router } from '../trpc';

const DASHBOARD = {
  revenue: { today: 15750, week: 98500, month: 420000, growth: 18, chart: [420, 380, 450, 390, 470, 520, 490] },
  bookings: { today: 47, week: 310, month: 1350, completionRate: 92, chart: [35, 42, 38, 45, 52, 48, 47] },
  users: { total: 28500, newToday: 42, activeToday: 1250, retentionRate: 78 },
  technicians: { total: 520, active: 480, newThisMonth: 28, avgRating: 4.7 },
  topServices: [
    { name: 'مكياج', bookings: 320, revenue: 96000, growth: 22 },
    { name: 'تنظيف بشرة', bookings: 280, revenue: 56000, growth: 15 },
    { name: 'مساج', bookings: 250, revenue: 62500, growth: 12 },
    { name: 'مانيكير', bookings: 220, revenue: 33000, growth: 18 },
    { name: 'تسريحة شعر', bookings: 180, revenue: 45000, growth: 8 },
  ],
  forecast: { nextMonthRevenue: 480000, nextMonthBookings: 1500, confidence: 85 },
};

export const adminAnalyticsV2Router = router({
  dashboard: adminProcedure.query(() => DASHBOARD),
  daily: adminProcedure.query(() => ({ labels: ['سبت','أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة'], revenue: [12000, 15000, 18000, 20000, 22000, 25000, 28000], bookings: [35, 42, 48, 52, 55, 60, 65] })),
  forecast: adminProcedure.query(() => DASHBOARD.forecast),
});
