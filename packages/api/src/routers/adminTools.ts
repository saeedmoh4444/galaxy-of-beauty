import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { adminProcedure, router } from '../trpc';

export const adminToolsRouter = router({
  // ── Audit Log Viewer ──────────────────────────────────
  auditLog: adminProcedure
    .input(z.object({
      page: z.number().default(1), limit: z.number().default(50),
      userId: z.number().optional(), action: z.string().optional(),
      fromDate: z.string().optional(), toDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {};
      if (input.userId) where['userId'] = input.userId;
      if (input.fromDate || input.toDate) {
        const createdAt: Record<string, Date> = {};
        if (input.fromDate) createdAt['gte'] = new Date(input.fromDate);
        if (input.toDate) createdAt['lte'] = new Date(input.toDate);
        where['createdAt'] = createdAt;
      }

      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: where as never,
          orderBy: { createdAt: 'desc' },
          skip, take: input.limit,
        }),
        prisma.auditLog.count({ where: where as never }),
      ]);

      return { items, total, page: input.page };
    }),

  // ── Bulk Operations ────────────────────────────────────
  bulkNotify: adminProcedure
    .input(z.object({
      role: z.enum(['CUSTOMER', 'TECHNICIAN', 'ALL']),
      titleAr: z.string(), titleEn: z.string(),
      bodyAr: z.string(), bodyEn: z.string(),
      channel: z.enum(['in_app', 'push', 'email']).default('in_app'),
    }))
    .mutation(async ({ input }) => {
      const userWhere = input.role === 'ALL' ? {} : { role: input.role };
      const users = await prisma.user.findMany({
        where: { ...userWhere, isActive: true },
        select: { id: true, preferredLanguage: true },
      });

      // Create notifications in batches
      const batchSize = 100;
      let created = 0;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        await prisma.notification.createMany({
          data: batch.map((u) => ({
            userId: u.id,
            type: 'admin_broadcast',
            titleJson: { ar: input.titleAr, en: input.titleEn },
            bodyJson: { ar: input.bodyAr, en: input.bodyEn },
            sentVia: [input.channel],
          })),
        });
        created += batch.length;
      }

      return { notified: created };
    }),

  // ── Impersonation ──────────────────────────────────────
  impersonate: adminProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const targetUser = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true, email: true, name: true, role: true, preferredLanguage: true },
      });

      if (!targetUser) throw new TRPCError({ code: 'NOT_FOUND' });

      // Log the impersonation
      await prisma.auditLog.create({
        data: {
          adminId: ctx.user.id,
          action: 'IMPERSONATE',
          targetType: 'User',
          targetId: String(input.userId),
          newValue: { impersonatedUser: targetUser.email },
        },
      });

      return {
        impersonatedUser: targetUser,
        message: `Now viewing as ${targetUser.name} (${targetUser.role})`,
      };
    }),

  // ── System Health ──────────────────────────────────────
  health: adminProcedure.query(async () => {
    const [userCount, bookingCount, revenueAgg, activeToday, techCount, serviceCount, disputeCount, completedCount] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ where: { status: 'COMPLETED' }, _sum: { totalAmount: true } }),
      prisma.booking.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
      prisma.user.count({ where: { role: 'TECHNICIAN' } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
    ]);

    const completionRate = bookingCount > 0 ? Math.round((completedCount / bookingCount) * 100) : 0;

    return {
      users: userCount,
      totalBookings: bookingCount,
      totalRevenue: Number(revenueAgg._sum.totalAmount || 0),
      bookingsToday: activeToday,
      technicians: techCount,
      services: serviceCount,
      openDisputes: disputeCount,
      completionRate,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      dbStatus: 'connected',
    };
  }),

  // ── Data Export Hub ────────────────────────────────────
  exportData: adminProcedure
    .input(z.object({
      entity: z.enum(['users', 'bookings', 'payments', 'reviews', 'technicians']),
      format: z.enum(['json', 'csv']).default('json'),
      fromDate: z.string().optional(), toDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const where: Record<string, unknown> = {};
      if (input.fromDate || input.toDate) {
        const createdAt: Record<string, Date> = {};
        if (input.fromDate) createdAt['gte'] = new Date(input.fromDate);
        if (input.toDate) createdAt['lte'] = new Date(input.toDate);
        where['createdAt'] = createdAt;
      }

      let data: unknown[] = [];
      switch (input.entity) {
        case 'users':
          data = await prisma.user.findMany({ where: where as never, select: { id: true, name: true, email: true, role: true, createdAt: true }, take: 10000 });
          break;
        case 'bookings':
          data = await prisma.booking.findMany({ where: where as never, take: 10000 });
          break;
        case 'payments':
          data = await prisma.payment.findMany({ where: where as never, take: 10000 });
          break;
        case 'reviews':
          data = await prisma.review.findMany({ where: where as never, take: 10000 });
          break;
        case 'technicians':
          data = await prisma.technician.findMany({ where: where as never, include: { user: { select: { name: true, email: true } } }, take: 10000 });
          break;
      }

      if (input.format === 'csv') {
        if (data.length === 0) return { csv: '', count: 0 };
        const headers = Object.keys(data[0] as Record<string, unknown>).join(',');
        const rows = data.map((r) => Object.values(r as Record<string, unknown>).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
        return { csv: [headers, ...rows].join('\n'), count: data.length };
      }

      return { json: data, count: data.length };
    }),

  // ── A/B Test Configuration ─────────────────────────────
  abTests: adminProcedure.query(async () => {
    return prisma.platformConfig.findMany({
      where: { key: { startsWith: 'ab_test:' } },
    });
  }),

  createAbTest: adminProcedure
    .input(z.object({
      name: z.string(), variantA: z.string(), variantB: z.string(),
      trafficSplit: z.number().min(1).max(99).default(50),
    }))
    .mutation(async ({ ctx, input }) => {
      await prisma.platformConfig.create({
        data: {
          key: `ab_test:${input.name}`,
          value: JSON.stringify(input),
          updatedBy: ctx.user.id,
        },
      });
      return { success: true };
    }),
});
