import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@galaxy/db';
import {
  publicProcedure,
  adminProcedure,
  technicianProcedure,
  router,
} from '../trpc';
import { addTechnicianServiceSchema } from '../validators/catalog';

/** Shared pagination / filter input for the technician list endpoint. */
const technicianListSchema = z.object({
  city: z.string().optional(),
  serviceId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const technicianRouter = router({
  /**
   * list — paginated listing of verified technicians.
   * Public.
   * Optionally filters by city and/or a service the technician offers.
   * Ordered by average rating descending.
   */
  list: publicProcedure
    .input(technicianListSchema)
    .query(async ({ input }) => {
      const { city, serviceId, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = { kycStatus: 'VERIFIED' };

      if (city) {
        where.city = city;
      }

      if (serviceId) {
        where.technicianServices = {
          some: {
            serviceId,
            isActive: true,
          },
        };
      }

      const [items, total] = await Promise.all([
        prisma.technician.findMany({
          where,
          orderBy: { ratingAvg: 'desc' },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        }),
        prisma.technician.count({ where }),
      ]);

      return { items, total, page, limit };
    }),

  /**
   * getById — full technician profile by user ID.
   * Public.
   * Includes user info, offered services (with category), and review / booking stats.
   */
  getById: publicProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const technician = await prisma.technician.findUnique({
        where: { userId: input.userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              preferredLanguage: true,
              createdAt: true,
            },
          },
          technicianServices: {
            where: { isActive: true },
            include: {
              service: {
                select: {
                  id: true,
                  titleJson: true,
                  basePrice: true,
                  durationMin: true,
                  imageUrl: true,
                  isPopular: true,
                  category: {
                    select: { id: true, nameJson: true, slug: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician not found',
        });
      }

      return technician;
    }),

  /**
   * getServices — list all services a specific technician offers (with custom pricing).
   * Public.
   * techId refers to the Technician.id (not User.id).
   */
  getServices: publicProcedure
    .input(z.object({ techId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const services = await prisma.technicianService.findMany({
        where: { technicianId: input.techId, isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          service: {
            include: {
              category: { select: { id: true, nameJson: true, slug: true } },
            },
          },
        },
      });

      return services;
    }),

  // ---------------------------------------------------------------------------
  // Technician self-service (auth required, TECHNICIAN role)
  // ---------------------------------------------------------------------------

  /**
   * addService — add a service to the authenticated technician's offerings.
   * Technician only.
   */
  addService: technicianProcedure
    .input(addTechnicianServiceSchema)
    .mutation(async ({ ctx, input }) => {
      const technician = await prisma.technician.findUnique({
        where: { userId: ctx.user.id },
      });
      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician profile not found',
        });
      }

      const service = await prisma.service.findUnique({
        where: { id: input.serviceId, isActive: true },
      });
      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      const mapping = await prisma.technicianService.create({
        data: {
          technicianId: technician.id,
          serviceId: input.serviceId,
          customPrice: input.customPrice,
        },
      });

      return mapping;
    }),

  /**
   * removeService — soft-delete a service from the technician's offerings.
   * Technician only.  Verifies ownership of the mapping.
   */
  removeService: technicianProcedure
    .input(z.object({ mappingId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const mapping = await prisma.technicianService.findUnique({
        where: { id: input.mappingId },
        include: { technician: { select: { userId: true } } },
      });

      if (!mapping) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service mapping not found',
        });
      }
      if (mapping.technician.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only remove your own service mappings',
        });
      }

      await prisma.technicianService.update({
        where: { id: input.mappingId },
        data: { isActive: false },
      });

      return { success: true };
    }),

  /**
   * updateService — update the custom price on a technician's service mapping.
   * Technician only.  Verifies ownership.
   */
  updateService: technicianProcedure
    .input(
      z.object({
        mappingId: z.number().int().positive(),
        customPrice: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const mapping = await prisma.technicianService.findUnique({
        where: { id: input.mappingId },
        include: { technician: { select: { userId: true } } },
      });

      if (!mapping) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service mapping not found',
        });
      }
      if (mapping.technician.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own service mappings',
        });
      }

      const updated = await prisma.technicianService.update({
        where: { id: input.mappingId },
        data: { customPrice: input.customPrice },
      });

      return updated;
    }),

  /**
   * submitKyc — submit KYC documents for review.
   * Technician only.
   * Sets kycStatus to SUBMITTED and stores the uploaded documents.
   */
  submitKyc: technicianProcedure
    .input(
      z.object({
        documents: z.array(
          z.object({
            type: z.string().min(1),
            url: z.string().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const technician = await prisma.technician.findUnique({
        where: { userId: ctx.user.id },
      });
      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician profile not found',
        });
      }

      const updated = await prisma.technician.update({
        where: { userId: ctx.user.id },
        data: {
          kycStatus: 'SUBMITTED',
          kycDocuments: input.documents,
        },
      });

      return updated;
    }),

  /**
   * getMyKycStatus — return the current technician's KYC status, documents, and notes.
   * Technician only.
   */
  getMyKycStatus: technicianProcedure.query(async ({ ctx }) => {
    const technician = await prisma.technician.findUnique({
      where: { userId: ctx.user.id },
      select: { kycStatus: true, kycDocuments: true, kycNotes: true },
    });

    if (!technician) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Technician profile not found',
      });
    }

    return technician;
  }),

  // ---------------------------------------------------------------------------
  // Admin KYC management
  // ---------------------------------------------------------------------------

  /**
   * verifyKyc — approve or reject a technician's KYC submission.
   * Admin only.
   */
  verifyKyc: adminProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        status: z.enum(['VERIFIED', 'REJECTED']),
        notes: z.string().optional(),
      }),
    )
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
        data: {
          kycStatus: input.status,
          kycNotes: input.notes,
        },
      });

      return updated;
    }),

  // ---------------------------------------------------------------------------
  // Busy / availability status
  // ---------------------------------------------------------------------------

  /**
   * getBusyStatus — check if a technician is currently busy with an active booking.
   * Public.  Accepts the user ID of the technician.
   */
  getBusyStatus: publicProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const now = new Date();
      const activeBooking = await prisma.booking.findFirst({
        where: {
          technicianId: input.userId,
          status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
          startAt: { lte: now },
          endAt: { gte: now },
        },
        select: { id: true, startAt: true, endAt: true },
      });

      return {
        isBusy: !!activeBooking,
        currentBooking: activeBooking ?? null,
      };
    }),

  /**
   * toggleBusy — toggle the availability of all upcoming unbooked slots for the
   * authenticated technician.  If any slot is currently available, all become
   * unavailable, and vice versa.
   * Technician only.
   */
  toggleBusy: technicianProcedure.mutation(async ({ ctx }) => {
    const technician = await prisma.technician.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!technician) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Technician profile not found',
      });
    }

    // Collect all upcoming unbooked availability slots for this technician
    const now = new Date();
    const upcomingSlots = await prisma.availabilitySlot.findMany({
      where: {
        technicianId: technician.id,
        startAt: { gte: now },
        isBooked: false,
      },
    });

    if (upcomingSlots.length === 0) {
      return {
        toggled: false,
        isAvailable: false,
        affectedSlots: 0,
        message: 'No upcoming availability slots to toggle',
      };
    }

    // Toggle: if ANY slot is available, make ALL unavailable.
    // If ALL are already unavailable, make them all available.
    const anyAvailable = upcomingSlots.some((s) => s.isAvailable);
    const newAvailability = !anyAvailable;

    await prisma.availabilitySlot.updateMany({
      where: {
        id: { in: upcomingSlots.map((s) => s.id) },
      },
      data: { isAvailable: newAvailability },
    });

    return {
      toggled: true,
      isAvailable: newAvailability,
      affectedSlots: upcomingSlots.length,
      message: newAvailability
        ? 'Technician marked as available'
        : 'Technician marked as unavailable',
    };
  }),
});
