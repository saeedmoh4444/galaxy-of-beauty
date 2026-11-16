import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { adminProcedure, technicianProcedure, router } from '../trpc';
import { computeDynamicPrice } from '../lib/pricing';

export const technicianPerformanceRouter = router({
  myStats: technicianProcedure.query(async ({ ctx }) => {
    const tech = await prisma.technician.findUnique({ where: { userId: ctx.user.id } });
    if (!tech) return null;
    const monthStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      customerAgg,
      monthlyRevenue,
      galleryPhotos,
    ] = await Promise.all([
      prisma.booking.count({ where: { technicianId: ctx.user.id } }),
      prisma.booking.count({ where: { technicianId: ctx.user.id, status: 'COMPLETED' } }),
      prisma.booking.count({ where: { technicianId: ctx.user.id, status: 'CANCELLED' } }),
      // W4-1 — real CRM metrics: customers are derived from actual
      // bookings, never from fallback constants.
      prisma.booking.groupBy({
        by: ['customerId'],
        where: { technicianId: ctx.user.id },
        _count: { _all: true },
        _min: { createdAt: true },
      }),
      prisma.booking.aggregate({
        where: {
          technicianId: ctx.user.id,
          status: 'COMPLETED',
          createdAt: { gte: monthStartDate },
        },
        _sum: { totalAmount: true },
      }),
      prisma.galleryImage.count({
        where: { technicianId: ctx.user.id, isPublished: true },
      }),
    ]);
    return {
      totalBookings,
      completedBookings,
      cancelRate: totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0,
      rating: Number(tech.ratingAvg),
      // W4-1 additions (pro-tools CRM card + mobile pro-tools grid).
      totalCustomers: customerAgg.length,
      regularCustomers: customerAgg.filter((c) => c._count._all >= 2).length,
      newThisMonth: customerAgg.filter(
        (c) => c._min.createdAt && c._min.createdAt >= monthStartDate,
      ).length,
      monthlyRevenue: Number(monthlyRevenue._sum.totalAmount ?? 0),
      avgRating: Number(tech.ratingAvg),
      galleryPhotos,
      // W4-1 — the pro-tools SheLeads badge shows the technician's OWN
      // profile (was a fabricated persona: "نورة القحطاني", 8y, team 12).
      city: tech.city,
      yearsOfExperience: tech.yearsOfExperience ?? 0,
    };
  }),

  /**
   * W4-1 — pricing suggestion derived from the REAL dynamic-pricing engine.
   * The top service by booking volume, priced through computeDynamicPrice
   * (tier + peak/surge rules) — never a hardcoded suggestion.
   */
  pricingSuggestion: technicianProcedure.query(async ({ ctx }) => {
    const tech = await prisma.technician.findUnique({ where: { userId: ctx.user.id } });
    if (!tech) return null;

    const top = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: { technicianId: ctx.user.id },
      _count: { _all: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: 1,
    });
    if (!top[0]) return null;

    const service = await prisma.service.findUnique({
      where: { id: top[0].serviceId },
      include: { category: { select: { id: true } } },
    });
    if (!service) return null;

    const rules = await prisma.pricingRule.findMany({
      where: {
        isActive: true,
        OR: [
          { serviceId: service.id },
          { categoryId: service.categoryId },
          { serviceId: null, categoryId: null },
        ],
      },
    });

    const breakdown = computeDynamicPrice({
      base: Number(service.basePrice),
      tier: tech.tier,
      serviceId: service.id,
      categoryId: service.categoryId,
      rules: rules.map((r) => ({ ...r, priceMultiplier: Number(r.priceMultiplier) })),
      date: new Date(),
      surgeRatio: 0,
    });

    // Demand: this month's bookings vs last month's for the top service.
    const monthStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const [thisMonthCount, lastMonthCount] = await Promise.all([
      prisma.booking.count({
        where: {
          technicianId: ctx.user.id,
          serviceId: service.id,
          createdAt: { gte: monthStartDate },
        },
      }),
      prisma.booking.count({
        where: {
          technicianId: ctx.user.id,
          serviceId: service.id,
          createdAt: { gte: lastMonthStart, lt: monthStartDate },
        },
      }),
    ]);
    const demand = thisMonthCount >= lastMonthCount && thisMonthCount > 0 ? 'high' : 'low';

    return {
      serviceId: service.id,
      serviceName: (service.titleJson as { en?: string; ar?: string })?.en ?? '',
      currentPrice: Number(service.basePrice),
      suggestedPrice: breakdown.total,
      demand: demand as 'low' | 'medium' | 'high',
    };
  }),

  leaderboard: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        sortBy: z.enum(['bookings', 'rating', 'earnings']).default('bookings'),
      }),
    )
    .query(async ({ input }) => {
      return prisma.technician.findMany({
        where: { kycStatus: 'VERIFIED' },
        orderBy: input.sortBy === 'rating' ? { ratingAvg: 'desc' } : { completedBookings: 'desc' },
        take: input.limit,
        select: {
          userId: true,
          ratingAvg: true,
          completedBookings: true,
          user: { select: { name: true } },
        },
      });
    }),
});
