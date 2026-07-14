/**
 * Admin Analytics Service
 *
 * Provides aggregated metrics for the admin dashboard:
 *   - Revenue trends (daily/weekly/monthly)
 *   - Booking statistics (by status, city, service)
 *   - User growth (new registrations)
 *   - Technician performance (ratings, completion rate)
 *   - Platform fees collected
 */

import prisma from '../config/database.js';
import logger from '../config/logger.js';

// =============================================================================
// Dashboard Overview
// =============================================================================

/**
 * Get the admin dashboard overview — key metrics at a glance.
 */
export async function getDashboardOverview() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    totalCustomers,
    totalTechnicians,
    totalBookings,
    bookingsLast30Days,
    completedBookings,
    revenue30Days,
    pendingPayouts,
    disputesOpen,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
    prisma.user.count({ where: { role: 'TECHNICIAN', isActive: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.booking.count({ where: { status: 'COMPLETED', updatedAt: { gte: thirtyDaysAgo } } }),
    prisma.payment.aggregate({
      where: { status: 'CAPTURED', updatedAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true, commission: true },
    }),
    prisma.payout.count({ where: { status: 'PENDING' } }),
    prisma.dispute.count({ where: { status: 'OPEN' } }),
  ]);

  // New users in last 7 days
  const newUsers7Days = await prisma.user.count({
    where: { createdAt: { gte: sevenDaysAgo } },
  });

  // Completion rate
  const completionRate = bookingsLast30Days > 0
    ? Math.round((completedBookings / bookingsLast30Days) * 100)
    : 0;

  return {
    users: {
      totalCustomers,
      totalTechnicians,
      newLast7Days: newUsers7Days,
    },
    bookings: {
      total: totalBookings,
      last30Days: bookingsLast30Days,
      completedLast30Days: completedBookings,
      completionRate,
    },
    revenue: {
      last30Days: Number(revenue30Days._sum.amount || 0),
      platformFees: Number(revenue30Days._sum.commission || 0),
    },
    payouts: {
      pending: pendingPayouts,
    },
    disputes: {
      open: disputesOpen,
    },
    generatedAt: now.toISOString(),
  };
}

// =============================================================================
// Revenue Charts
// =============================================================================

/**
 * Get daily revenue for the past N days (for line charts).
 */
export async function getRevenueChart(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const payments = await prisma.$queryRaw`
    SELECT
      DATE("updatedAt") AS day,
      SUM(amount)::FLOAT AS revenue,
      SUM(commission)::FLOAT AS fees,
      COUNT(*)::INT AS transactions
    FROM payments
    WHERE status = 'CAPTURED'
      AND "updatedAt" >= ${startDate}
    GROUP BY DATE("updatedAt")
    ORDER BY day ASC
  `;

  return {
    period: `${days} days`,
    startDate: startDate.toISOString(),
    data: payments,
  };
}

// =============================================================================
// Booking Stats
// =============================================================================

/**
 * Get booking counts grouped by status.
 */
export async function getBookingStats() {
  const stats = await prisma.booking.groupBy({
    by: ['status'],
    _count: { id: true },
    _sum: { totalAmount: true },
  });

  const byStatus = {};
  for (const row of stats) {
    byStatus[row.status] = {
      count: row._count.id,
      totalAmount: Number(row._sum.totalAmount || 0),
    };
  }

  return byStatus;
}

/**
 * Get booking counts grouped by city (top 10).
 */
export async function getBookingsByCity() {
  const rows = await prisma.$queryRaw`
    SELECT
      a.city,
      COUNT(b.id)::INT AS bookings,
      SUM(b."totalAmount")::FLOAT AS revenue
    FROM bookings b
    JOIN addresses a ON b."addressId" = a.id
    WHERE b.status IN ('COMPLETED', 'PAID')
    GROUP BY a.city
    ORDER BY bookings DESC
    LIMIT 10
  `;

  return rows;
}

/**
 * Get top services by booking count.
 */
export async function getTopServices(limit = 10) {
  const rows = await prisma.$queryRaw`
    SELECT
      s.id,
      s."titleJson"->>'ar' AS name_ar,
      s."titleJson"->>'en' AS name_en,
      COUNT(b.id)::INT AS bookings,
      SUM(b."totalAmount")::FLOAT AS revenue
    FROM bookings b
    JOIN services s ON b."serviceId" = s.id
    WHERE b.status IN ('COMPLETED', 'PAID')
    GROUP BY s.id, s."titleJson"
    ORDER BY bookings DESC
    LIMIT ${limit}
  `;

  return rows;
}

// =============================================================================
// Technician Performance
// =============================================================================

/**
 * Get top technicians by rating and completed bookings.
 */
export async function getTopTechnicians(limit = 10) {
  const technicians = await prisma.technician.findMany({
    where: { kycStatus: 'VERIFIED' },
    orderBy: [{ ratingAvg: 'desc' }, { completedBookings: 'desc' }],
    take: limit,
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return technicians.map((t) => ({
    id: t.id,
    userId: t.userId,
    name: t.user.name,
    avatarUrl: t.user.avatarUrl,
    city: t.city,
    ratingAvg: Number(t.ratingAvg),
    totalReviews: t.totalReviews,
    completedBookings: t.completedBookings,
  }));
}

/**
 * Get technician completion rate (completed vs cancelled/no-show).
 */
export async function getTechnicianCompletionRates() {
  const rows = await prisma.$queryRaw`
    SELECT
      t."userId" AS "userId",
      u.name,
      t.city,
      COUNT(*) FILTER (WHERE b.status = 'COMPLETED')::INT AS completed,
      COUNT(*) FILTER (WHERE b.status IN ('CANCELLED', 'NO_SHOW'))::INT AS cancelled,
      COUNT(*)::INT AS total
    FROM bookings b
    JOIN technicians t ON b."technicianId" = t."userId"
    JOIN users u ON t."userId" = u.id
    WHERE b.status IN ('COMPLETED', 'CANCELLED', 'NO_SHOW')
    GROUP BY t."userId", u.name, t.city
    HAVING COUNT(*) >= 5
    ORDER BY completed DESC
  `;

  return rows.map((r) => ({
    ...r,
    completionRate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
  }));
}

// =============================================================================
// User Growth
// =============================================================================

/**
 * Get new user registrations per day for the past N days.
 */
export async function getUserGrowthChart(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await prisma.$queryRaw`
    SELECT
      DATE(created_at) AS day,
      COUNT(*) FILTER (WHERE role = 'CUSTOMER')::INT AS customers,
      COUNT(*) FILTER (WHERE role = 'TECHNICIAN')::INT AS technicians,
      COUNT(*)::INT AS total
    FROM users
    WHERE created_at >= ${startDate}
    GROUP BY DATE(created_at)
    ORDER BY day ASC
  `;

  return { period: `${days} days`, data: rows };
}

// =============================================================================
// Platform Health
// =============================================================================

/**
 * Get platform health metrics.
 */
export async function getPlatformHealth() {
  const now = new Date();
  const oneHourAgo = new Date(now - 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

  const [bookingsLastHour, bookingsLast24h, activeTechnicians, pendingKYCs] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: oneHourAgo } } }),
    prisma.booking.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
    // Technicians with slots in the next 7 days are "active"
    prisma.availabilitySlot.groupBy({
      by: ['technicianId'],
      where: { startAt: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } },
    }).then((groups) => groups.length),
    prisma.technician.count({ where: { kycStatus: 'SUBMITTED' } }),
  ]);

  return {
    bookingsLastHour,
    bookingsLast24h,
    activeTechnicians,
    pendingKYCs,
    timestamp: now.toISOString(),
  };
}

export default {
  getDashboardOverview,
  getRevenueChart,
  getBookingStats,
  getBookingsByCity,
  getTopServices,
  getTopTechnicians,
  getTechnicianCompletionRates,
  getUserGrowthChart,
  getPlatformHealth,
};
