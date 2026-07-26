import prisma from '../config/database.js';

/**
 * Get admin dashboard statistics.
 */
export async function getDashboardStats() {
  const [
    totalUsers,
    totalTechnicians,
    totalCustomers,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRevenue,
    disputedBookings,
    pendingKYC,
    recentUsers,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'TECHNICIAN' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: { in: ['REQUESTED', 'ACCEPTED'] } } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.aggregate({
      where: { status: 'CAPTURED' },
      _sum: { amount: true },
    }),
    prisma.dispute.count({ where: { status: 'OPEN' } }),
    prisma.technician.count({ where: { kycStatus: 'SUBMITTED' } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, role: true, createdAt: true } }),
    prisma.booking.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { service: { select: { titleJson: true } }, customer: { select: { name: true } } } }),
  ]);

  return {
    counts: {
      users: totalUsers,
      technicians: totalTechnicians,
      customers: totalCustomers,
      bookings: totalBookings,
      pendingBookings,
      completedBookings,
      disputedBookings,
      pendingKYC,
    },
    revenue: {
      total: Number(totalRevenue?._sum?.amount || 0),
    },
    recentUsers,
    recentBookings,
  };
}

/**
 * Get revenue over time (last 30 days).
 */
export async function getRevenueChart() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Single query with GROUP BY — replaces 30 sequential queries
  const payments = await prisma.$queryRaw`
    SELECT DATE("createdAt") as date, SUM("amount")::decimal as revenue
    FROM "payments"
    WHERE status = 'CAPTURED' AND "createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  // Fill in missing days with zero revenue
  const resultMap = {};
  for (const row of payments) {
    const dateStr = new Date(row.date).toISOString().split('T')[0];
    resultMap[dateStr] = Number(row.revenue);
  }

  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({ date: dateStr, revenue: resultMap[dateStr] || 0 });
  }

  return days;
}

/**
 * Get booking statistics by status.
 */
export async function getBookingStats() {
  const statuses = ['REQUESTED', 'ACCEPTED', 'PAYMENT_AUTHORIZED', 'CONFIRMED_OFFLINE', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'NO_SHOW'];

  const counts = await Promise.all(
    statuses.map(async (status) => ({
      status,
      count: await prisma.booking.count({ where: { status } }),
    })),
  );

  return counts;
}

export default { getDashboardStats, getRevenueChart, getBookingStats };
