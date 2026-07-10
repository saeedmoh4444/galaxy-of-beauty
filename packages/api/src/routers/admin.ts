import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';

export const adminRouter = router({
  dashboardStats: adminProcedure.query(async () => {
    const [
      totalUsers,
      totalBookings,
      totalRevenue,
      totalTechnicians,
      bookingsByStatus,
      recentBookings,
      topTechnicians,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'CAPTURED' },
      }),
      prisma.technician.count(),
      prisma.booking.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          technician: { select: { id: true, name: true } },
          service: { select: { id: true, titleJson: true } },
        },
      }),
      prisma.technician.findMany({
        take: 5,
        orderBy: { completedBookings: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return {
      totalUsers,
      totalBookings,
      totalRevenue: totalRevenue._sum.amount?.toNumber() ?? 0,
      totalTechnicians,
      bookingsByStatus: bookingsByStatus.map((b) => ({
        status: b.status,
        count: b._count,
      })),
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        status: b.status,
        totalAmount: b.totalAmount.toNumber(),
        customer: b.customer,
        technician: b.technician,
        service: b.service,
        createdAt: b.createdAt,
      })),
      topTechnicians: topTechnicians.map((t) => ({
        id: t.id,
        userId: t.userId,
        name: t.user.name,
        email: t.user.email,
        completedBookings: t.completedBookings,
        ratingAvg: t.ratingAvg.toNumber(),
      })),
    };
  }),

  listTechnicians: adminProcedure
    .input(
      z
        .object({
          kycStatus: z
            .enum(['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'])
            .optional(),
          page: z.number().optional().default(1),
          limit: z.number().optional().default(20),
        })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const where = input.kycStatus
        ? { kycStatus: input.kycStatus as any }
        : {};
      const skip = (input.page - 1) * input.limit;

      const [items, total] = await Promise.all([
        prisma.technician.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isActive: true,
                suspendedAt: true,
                createdAt: true,
              },
            },
          },
        }),
        prisma.technician.count({ where }),
      ]);

      return {
        items: items.map((t) => ({
          id: t.id,
          userId: t.userId,
          city: t.city,
          area: t.area,
          kycStatus: t.kycStatus,
          kycNotes: t.kycNotes,
          isEcoFriendly: t.isEcoFriendly,
          completedBookings: t.completedBookings,
          ratingAvg: t.ratingAvg.toNumber(),
          hourlyRate: t.hourlyRate.toNumber(),
          suspendedAt: t.suspendedAt,
          user: t.user,
        })),
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  listCustomers: adminProcedure
    .input(
      z
        .object({
          page: z.number().optional().default(1),
          limit: z.number().optional().default(20),
          search: z.string().optional(),
        })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const where: any = { role: 'CUSTOMER' };
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
          { phone: { contains: input.search } },
        ];
      }
      const skip = (input.page - 1) * input.limit;

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            suspendedAt: true,
            createdAt: true,
            lastLoginAt: true,
            _count: { select: { bookingsAsCustomer: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        items,
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  suspendUser: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      });
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const now = new Date();
      const isSuspended = user.suspendedAt !== null;

      const updated = await prisma.user.update({
        where: { id: input.userId },
        data: {
          suspendedAt: isSuspended ? null : now,
          suspendReason: isSuspended ? null : (input.reason ?? null),
          isActive: isSuspended,
        },
      });

      return {
        userId: updated.id,
        isActive: updated.isActive,
        suspendedAt: updated.suspendedAt,
        message: isSuspended
          ? 'User has been unsuspended'
          : 'User has been suspended',
      };
    }),

  changeUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(['CUSTOMER', 'TECHNICIAN', 'ADMIN']),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      });
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const updated = await prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: { id: true, name: true, email: true, role: true },
      });

      return updated;
    }),

  getAllBookings: adminProcedure
    .input(
      z
        .object({
          status: z
            .enum([
              'REQUESTED',
              'ACCEPTED',
              'PAYMENT_AUTHORIZED',
              'CONFIRMED_OFFLINE',
              'PAID',
              'IN_PROGRESS',
              'COMPLETED',
              'REJECTED',
              'CANCELLED',
              'NO_SHOW',
            ])
            .optional(),
          page: z.number().optional().default(1),
          limit: z.number().optional().default(20),
        })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const where: any = {};
      if (input.status) where.status = input.status;
      const skip = (input.page - 1) * input.limit;

      const [items, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            technician: { select: { id: true, name: true, phone: true } },
            service: { select: { id: true, titleJson: true, basePrice: true } },
            payment: { select: { id: true, status: true, amount: true } },
          },
        }),
        prisma.booking.count({ where }),
      ]);

      return {
        items: items.map((b) => ({
          id: b.id,
          bookingCode: b.bookingCode,
          status: b.status,
          totalAmount: b.totalAmount.toNumber(),
          platformFee: b.platformFee.toNumber(),
          startAt: b.startAt,
          endAt: b.endAt,
          customer: b.customer,
          technician: b.technician,
          service: b.service,
          payment: b.payment,
          createdAt: b.createdAt,
        })),
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  getFinancials: adminProcedure.query(async () => {
    const [revenueAgg, platformFeeAgg, technicianEarningsAgg, payoutsAgg] =
      await Promise.all([
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'CAPTURED' },
        }),
        prisma.booking.aggregate({
          _sum: { platformFee: true },
        }),
        prisma.booking.aggregate({
          _sum: { totalAmount: true },
          where: { status: 'COMPLETED' },
        }),
        prisma.payout.aggregate({
          _sum: { amount: true },
          where: { status: 'PENDING' },
        }),
      ]);

    return {
      totalRevenue: revenueAgg._sum.amount?.toNumber() ?? 0,
      platformFees: platformFeeAgg._sum.platformFee?.toNumber() ?? 0,
      technicianEarnings: technicianEarningsAgg._sum.totalAmount?.toNumber() ?? 0,
      pendingPayouts: payoutsAgg._sum.amount?.toNumber() ?? 0,
    };
  }),

  verifyKyc: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        status: z.enum(['VERIFIED', 'REJECTED']),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const technician = await prisma.technician.findUnique({
        where: { userId: input.userId },
      });
      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician not found for this user',
        });
      }

      const updated = await prisma.technician.update({
        where: { userId: input.userId },
        data: {
          kycStatus: input.status,
          kycNotes: input.notes ?? null,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          adminId: ctx.user.id,
          action: 'VERIFY_KYC',
          targetType: 'Technician',
          targetId: String(technician.id),
          newValue: { kycStatus: input.status, notes: input.notes },
        },
      });

      return {
        id: updated.id,
        userId: updated.userId,
        kycStatus: updated.kycStatus,
        kycNotes: updated.kycNotes,
        user: updated.user,
      };
    }),

  toggleEcoFriendly: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const technician = await prisma.technician.findUnique({
        where: { userId: input.userId },
      });
      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician not found',
        });
      }

      const updated = await prisma.technician.update({
        where: { userId: input.userId },
        data: { isEcoFriendly: !technician.isEcoFriendly },
        select: {
          id: true,
          userId: true,
          isEcoFriendly: true,
        },
      });

      return updated;
    }),

  integrityCheck: adminProcedure.query(async () => {
    const issues: string[] = [];

    // Negative wallet balances
    const negativeWallets = await prisma.wallet.findMany({
      where: { balance: { lt: 0 } },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (negativeWallets.length > 0) {
      issues.push(
        `Found ${negativeWallets.length} wallet(s) with negative balance`,
      );
    }

    // Users who are CUSTOMER but have a Technician profile (role mismatch)
    const customerTechnicians = await prisma.technician.findMany({
      where: { user: { role: 'CUSTOMER' } },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (customerTechnicians.length > 0) {
      issues.push(
        `Found ${customerTechnicians.length} technician profile(s) linked to CUSTOMER role users`,
      );
    }

    // Bookings stuck in REQUESTED for more than 7 days
    const staleBookings = await prisma.booking.count({
      where: {
        status: 'REQUESTED',
        createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });
    if (staleBookings > 0) {
      issues.push(`Found ${staleBookings} booking(s) stuck in REQUESTED status for over 7 days`);
    }

    return {
      passed: issues.length === 0,
      issues,
      summary: {
        negativeWallets: negativeWallets.length,
        roleMismatches: customerTechnicians.length,
        staleRequestedBookings: staleBookings,
      },
    };
  }),
});
