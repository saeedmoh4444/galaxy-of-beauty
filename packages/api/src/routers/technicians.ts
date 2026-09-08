import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { notFound } from '../lib/errors';
import { publicProcedure, adminProcedure, technicianProcedure, router } from '../trpc';
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
  list: publicProcedure.input(technicianListSchema).query(async ({ input }) => {
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
   * trainers — E3 fitness vertical: verified technicians offering
   * fitness-category services. The 1:1 session flow itself is the standard
   * Booking engine (unchanged).
   * Public.
   */
  trainers: publicProcedure.query(async () => {
    const FITNESS_SLUGS = ['fitness', 'personal-training', 'yoga', 'pilates', 'gym'];
    return prisma.technician.findMany({
      where: {
        kycStatus: 'VERIFIED',
        technicianServices: {
          some: {
            isActive: true,
            service: { category: { slug: { in: FITNESS_SLUGS } } },
          },
        },
      },
      orderBy: { ratingAvg: 'desc' },
      take: 50,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }),

  /**
   * barberettes — E5: verified technicians offering barberette-category
   * services (short cuts, fades). The booking flow itself is the standard
   * technician Booking engine (unchanged). Public.
   */
  barberettes: publicProcedure.query(async () => {
    const BARBERETTE_SLUGS = ['barberette', 'pixie-cut', 'layered-bob', 'clean-fade'];
    return prisma.technician.findMany({
      where: {
        kycStatus: 'VERIFIED',
        technicianServices: {
          some: {
            isActive: true,
            service: { category: { slug: { in: BARBERETTE_SLUGS } } },
          },
        },
      },
      orderBy: { ratingAvg: 'desc' },
      take: 50,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
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
        throw notFound('Technician');
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
        throw notFound('Technician profile');
      }

      const service = await prisma.service.findUnique({
        where: { id: input.serviceId, isActive: true },
      });
      if (!service) {
        throw notFound('Service');
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
        throw notFound('Service mapping');
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
        throw notFound('Service mapping');
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
   * updateProfile — update the authenticated technician's profile fields
   * (B.8: previously the web form stubbed this — city/area/bio/buffer/eco
   * were decorative). Technician only. Partial updates: omitted fields are
   * left untouched, and bioAr/bioEn merge into bioJson per-language.
   */
  updateProfile: technicianProcedure
    .input(
      z
        .object({
          city: z.string().min(1).max(100).optional(),
          area: z.string().min(1).max(100).optional(),
          bioAr: z.string().max(2000).optional(),
          bioEn: z.string().max(2000).optional(),
          bufferMinutes: z.number().int().min(0).max(180).optional(),
          isEcoFriendly: z.boolean().optional(),
        })
        .refine((v) => Object.keys(v).length > 0, {
          message: 'At least one field is required',
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const technician = await prisma.technician.findUnique({
        where: { userId: ctx.user.id },
      });
      if (!technician) {
        throw notFound('Technician profile');
      }

      const data: {
        city?: string;
        area?: string;
        bioJson?: { ar?: string; en?: string };
        bufferMinutes?: number;
        isEcoFriendly?: boolean;
      } = {};
      if (input.city !== undefined) data.city = input.city;
      if (input.area !== undefined) data.area = input.area;
      if (input.bufferMinutes !== undefined) data.bufferMinutes = input.bufferMinutes;
      if (input.isEcoFriendly !== undefined) data.isEcoFriendly = input.isEcoFriendly;
      if (input.bioAr !== undefined || input.bioEn !== undefined) {
        const current = (technician.bioJson ?? {}) as { ar?: string; en?: string };
        data.bioJson = {
          ar: input.bioAr ?? current.ar,
          en: input.bioEn ?? current.en,
        };
      }

      return prisma.technician.update({
        where: { userId: ctx.user.id },
        data,
      });
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
        throw notFound('Technician profile');
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
        throw notFound('Technician');
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
  toggleBusy: technicianProcedure.input(z.object({})).mutation(async ({ ctx }) => {
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
