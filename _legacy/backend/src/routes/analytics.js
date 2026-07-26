import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import * as adminService from '../services/admin.js';
import * as analyticsService from '../services/analytics.js';

const router = Router();

/**
 * @route   GET /api/admin/stats
 * @desc    Admin dashboard overview statistics
 * @access  Admin
 */
router.get('/admin/stats', isAuth, hasRole('ADMIN'), async (_req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    const overview = await analyticsService.getDashboardOverview();
    res.json({ ...stats, overview });
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/admin/revenue-chart
 * @desc    Daily revenue data for charts
 * @access  Admin
 */
router.get('/admin/revenue-chart', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const chart = await analyticsService.getRevenueChart(days);
    res.json(chart);
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/admin/booking-stats
 * @desc    Booking statistics breakdown
 * @access  Admin
 */
router.get('/admin/booking-stats', isAuth, hasRole('ADMIN'), async (_req, res, next) => {
  try {
    const stats = await adminService.getBookingStats();
    const byCity = await analyticsService.getBookingsByCity();
    const topServices = await analyticsService.getTopServices(10);
    res.json({ stats, byCity, topServices });
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/admin/top-technicians
 * @desc    Top performing technicians
 * @access  Admin
 */
router.get('/admin/top-technicians', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const top = await analyticsService.getTopTechnicians(limit);
    const rates = await analyticsService.getTechnicianCompletionRates();
    res.json({ top, completionRates: rates });
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/admin/growth
 * @desc    User growth chart data
 * @access  Admin
 */
router.get('/admin/growth', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const growth = await analyticsService.getUserGrowthChart(days);
    res.json(growth);
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/admin/health
 * @desc    Platform health metrics
 * @access  Admin
 */
router.get('/admin/health', isAuth, hasRole('ADMIN'), async (_req, res, next) => {
  try {
    const health = await analyticsService.getPlatformHealth();
    res.json(health);
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/technician/earnings-chart
 * @desc    Technician's earnings over time (for charts)
 * @access  Technician
 */
router.get('/technician/earnings-chart', isAuth, hasRole('TECHNICIAN'), async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const earnings = await prisma.$queryRaw`
      SELECT
        DATE(wt."createdAt") AS day,
        SUM(wt.amount)::FLOAT AS earnings,
        COUNT(*)::INT AS transactions
      FROM wallet_transactions wt
      JOIN wallets w ON wt."walletId" = w.id
      WHERE w."userId" = ${req.user.userId}
        AND wt.type = 'CREDIT'
        AND wt.source = 'PLATFORM_FEE_SHARE'
        AND wt."createdAt" >= ${startDate}
      GROUP BY DATE(wt."createdAt")
      ORDER BY day ASC
    `;

    const totalEarnings = earnings.reduce((sum, e) => sum + e.earnings, 0);

    res.json({
      period: `${days} days`,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      data: earnings,
    });
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/customer/spending-insights
 * @desc    Customer spending analytics and insights
 * @access  Customer
 */
router.get('/customer/spending-insights', isAuth, hasRole('CUSTOMER'), async (req, res, next) => {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalSpent,
      thisMonthSpent,
      lastMonthSpent,
      bookingCount,
      favoriteCategory,
      averageSpend,
      streakData,
    ] = await Promise.all([
      // Total spent all time
      prisma.booking.aggregate({
        where: { customerId: req.user.userId, status: { in: ['COMPLETED', 'PAID'] } },
        _sum: { totalAmount: true },
      }),
      // This month
      prisma.booking.aggregate({
        where: { customerId: req.user.userId, status: { in: ['COMPLETED', 'PAID'] }, createdAt: { gte: thisMonth } },
        _sum: { totalAmount: true },
      }),
      // Last month
      prisma.booking.aggregate({
        where: { customerId: req.user.userId, status: { in: ['COMPLETED', 'PAID'] }, createdAt: { gte: lastMonth, lt: thisMonth } },
        _sum: { totalAmount: true },
      }),
      // Booking count
      prisma.booking.count({
        where: { customerId: req.user.userId, status: { in: ['COMPLETED', 'PAID'] } },
      }),
      // Favorite category (most booked)
      prisma.$queryRaw`
        SELECT c.name_json->>'ar' AS category, COUNT(*)::INT AS count
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN categories c ON s.category_id = c.id
        WHERE b.customer_id = ${req.user.userId}
          AND b.status IN ('COMPLETED', 'PAID')
        GROUP BY c.id, c.name_json
        ORDER BY count DESC
        LIMIT 3
      `,
      // Average spend
      prisma.booking.aggregate({
        where: { customerId: req.user.userId, status: { in: ['COMPLETED', 'PAID'] } },
        _avg: { totalAmount: true },
      }),
      // Get streak
      prisma.streak.findUnique({ where: { customerId: req.user.userId } }),
    ]);

    res.json({
      spending: {
        totalAllTime: Number(totalSpent._sum.totalAmount || 0),
        thisMonth: Number(thisMonthSpent._sum.totalAmount || 0),
        lastMonth: Number(lastMonthSpent._sum.totalAmount || 0),
        averagePerBooking: Math.round(Number(averageSpend._avg.totalAmount || 0) * 100) / 100,
        totalBookings: bookingCount,
      },
      favorites: favoriteCategory,
      streak: streakData ? {
        current: streakData.currentStreak,
        longest: streakData.longestStreak,
        lastBooking: streakData.lastBookingDate?.toISOString() || null,
      } : { current: 0, longest: 0, lastBooking: null },
      generatedAt: now.toISOString(),
    });
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/technician/peak-hours
 * @desc    Get technician's booking density by day of week and hour
 * @access  Technician
 */
router.get('/technician/peak-hours', isAuth, hasRole('TECHNICIAN'), async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        technicianId: req.user.userId,
        status: { in: ['COMPLETED', 'PAID'] },
      },
      select: { startAt: true },
      take: 500,
    });

    // Aggregate by day of week (0=Sun...6=Sat in Saudi Arabia)
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const byDay = Array(7).fill(0);
    const byHour = Array(24).fill(0);

    for (const b of bookings) {
      const d = new Date(b.startAt);
      byDay[d.getDay()]++;
      byHour[d.getHours()]++;
    }

    const maxDay = Math.max(...byDay, 1);
    const maxHour = Math.max(...byHour, 1);

    res.json({
      byDay: dayNames.map((name, i) => ({
        day: name,
        count: byDay[i],
        percentage: Math.round((byDay[i] / maxDay) * 100),
      })),
      byHour: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        label: `${h}:00`,
        count: byHour[h],
        percentage: Math.round((byHour[h] / maxHour) * 100),
      })),
      totalBookings: bookings.length,
    });
  } catch (error) { next(error); }
});

export default router;
