import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { prisma } from '@galaxy/db';

export const platformRouter = router({
  getSettings: publicProcedure.query(async () => {
    const configs = await prisma.platformConfig.findMany();
    const result: Record<string, string> = {};
    for (const c of configs) {
      result[c.key] = c.value;
    }
    return result;
  }),

  updateSetting: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const config = await prisma.platformConfig.upsert({
        where: { key: input.key },
        create: {
          key: input.key,
          value: input.value,
          updatedBy: ctx.user.id,
        },
        update: {
          value: input.value,
          updatedBy: ctx.user.id,
        },
      });

      return {
        key: config.key,
        value: config.value,
        updatedAt: config.updatedAt,
      };
    }),

  toggleMaintenance: adminProcedure.mutation(async () => {
    const config = await prisma.platformConfig.findUnique({
      where: { key: 'MAINTENANCE_MODE' },
    });

    const currentValue = config?.value === 'true';
    const newValue = (!currentValue).toString();

    const updated = await prisma.platformConfig.upsert({
      where: { key: 'MAINTENANCE_MODE' },
      create: {
        key: 'MAINTENANCE_MODE',
        value: newValue,
        description: 'Toggle maintenance mode for the entire platform',
        updatedBy: 1, // Will be set properly via ctx in real implementation
      },
      update: {
        value: newValue,
      },
    });

    return {
      maintenanceMode: updated.value === 'true',
      message: updated.value === 'true'
        ? 'Maintenance mode enabled'
        : 'Maintenance mode disabled',
    };
  }),

  getTerms: publicProcedure.query(async () => {
    // Return the latest terms version + content from PlatformConfig
    const [latestAcceptance, termsConfig] = await Promise.all([
      prisma.termsAcceptance.findFirst({
        orderBy: { acceptedAt: 'desc' },
        select: { termsVersion: true },
      }),
      prisma.platformConfig.findUnique({
        where: { key: 'TERMS_CONTENT' },
      }),
    ]);

    let content: { ar: string; en: string } | null = null;
    if (termsConfig?.value) {
      try {
        content = JSON.parse(termsConfig.value);
      } catch {
        content = { ar: termsConfig.value, en: termsConfig.value };
      }
    }

    return {
      version: latestAcceptance?.termsVersion ?? 'v1.0',
      content,
      updatedAt: termsConfig?.updatedAt ?? null,
    };
  }),

  updateTerms: adminProcedure
    .input(
      z.object({
        version: z.string().min(1),
        contentAr: z.string().min(1),
        contentEn: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Store terms content as JSON in PlatformConfig
      const contentJson = JSON.stringify({ ar: input.contentAr, en: input.contentEn });

      await prisma.platformConfig.upsert({
        where: { key: 'TERMS_CONTENT' },
        create: {
          key: 'TERMS_CONTENT',
          value: contentJson,
          description: `Terms & Conditions v${input.version}`,
          updatedBy: ctx.user.id,
        },
        update: {
          value: contentJson,
          description: `Terms & Conditions v${input.version}`,
          updatedBy: ctx.user.id,
        },
      });

      // Also store the version explicitly
      await prisma.platformConfig.upsert({
        where: { key: 'TERMS_VERSION' },
        create: {
          key: 'TERMS_VERSION',
          value: input.version,
          description: 'Current terms & conditions version',
          updatedBy: ctx.user.id,
        },
        update: {
          value: input.version,
          updatedBy: ctx.user.id,
        },
      });

      return {
        version: input.version,
        message: 'Terms content updated successfully',
      };
    }),

  acceptTerms: protectedProcedure
    .input(
      z.object({
        termsVersion: z.string(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Check if already accepted this version
      const existing = await prisma.termsAcceptance.findFirst({
        where: {
          userId: ctx.user.id,
          termsVersion: input.termsVersion,
        },
      });

      if (existing) {
        return {
          id: existing.id,
          message: 'Terms already accepted',
          alreadyAccepted: true,
        };
      }

      const acceptance = await prisma.termsAcceptance.create({
        data: {
          userId: ctx.user.id,
          termsVersion: input.termsVersion,
          ipAddress: input.ipAddress ?? '0.0.0.0',
          userAgent: input.userAgent ?? null,
        },
      });

      return {
        id: acceptance.id,
        termsVersion: acceptance.termsVersion,
        acceptedAt: acceptance.acceptedAt,
        alreadyAccepted: false,
      };
    }),

  getCities: publicProcedure.query(async () => {
    const cities = await prisma.saudiCity.findMany({
      where: { isActive: true },
      orderBy: [{ regionAr: 'asc' }, { nameAr: 'asc' }],
    });

    return cities.map((c) => ({
      id: c.id,
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      regionAr: c.regionAr,
      regionEn: c.regionEn,
    }));
  }),

  getAreas: publicProcedure
    .input(z.object({ cityName: z.string() }))
    .query(async ({ input }) => {
      const city = await prisma.saudiCity.findFirst({
        where: {
          OR: [
            { nameAr: input.cityName },
            { nameEn: { equals: input.cityName, mode: 'insensitive' } },
          ],
        },
        include: {
          areas: {
            where: { isActive: true },
            orderBy: { nameAr: 'asc' },
          },
        },
      });

      if (!city) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'City not found' });
      }

      return {
        city: {
          id: city.id,
          nameAr: city.nameAr,
          nameEn: city.nameEn,
        },
        areas: city.areas.map((a) => ({
          id: a.id,
          nameAr: a.nameAr,
          nameEn: a.nameEn,
        })),
      };
    }),

  exportBookings: adminProcedure
    .input(
      z
        .object({ format: z.enum(['csv', 'json']).optional().default('json') })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const bookings = await prisma.booking.findMany({
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          technician: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, titleJson: true } },
          payment: { select: { id: true, status: true, amount: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const data = bookings.map((b) => ({
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
        updatedAt: b.updatedAt,
      }));

      if (input.format === 'csv') {
        // Return JSON that the client can convert to CSV
        return { format: 'csv', data, total: data.length };
      }

      return { format: 'json', data, total: data.length };
    }),

  exportUsers: adminProcedure
    .input(
      z
        .object({ format: z.enum(['csv', 'json']).optional().default('json') })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          suspendedAt: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (input.format === 'csv') {
        return { format: 'csv', data: users, total: users.length };
      }

      return { format: 'json', data: users, total: users.length };
    }),

  getAuditLogs: adminProcedure
    .input(
      z
        .object({
          page: z.number().optional().default(1),
          limit: z.number().optional().default(20),
        })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;

      const [items, total] = await Promise.all([
        prisma.auditLog.findMany({
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.auditLog.count(),
      ]);

      return {
        items: items.map((log) => ({
          id: log.id,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          oldValue: log.oldValue,
          newValue: log.newValue,
          ipAddress: log.ipAddress,
          createdAt: log.createdAt,
          admin: log.admin,
        })),
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),
});
