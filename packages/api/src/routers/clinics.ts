/**
 * E2 — medical beauty clinics (first vertical pilot).
 * Public listing/detail + a light consultation-booking flow (consent-gated,
 * paid at the clinic). The core technician Booking engine stays untouched.
 * Treatment packages reuse the B.6 queue and are display-only.
 */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, customerProcedure, router } from '../trpc';

const TREATMENT_TYPES = ['dermatology', 'laser', 'injectables', 'dental', 'nutrition'] as const;

function consultationCode(): string {
  return `GOC-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

export const clinicsRouter = router({
  /** list — verified + active clinics (trust badge data for the cards). */
  list: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(DEFAULT_PAGE_SIZE),
        // E6d — women-only-staff clinics (female doctors).
        womenOnly: z.boolean().optional(),
      }),
    )
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {
        type: 'CLINIC',
        isActive: true,
        isVerified: true,
        ...(input.womenOnly ? { womenOnlyStaff: true } : {}),
      };
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.vendor.findMany({
          where: where as never,
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            clinicType: true,
            logoUrl: true,
            descriptionJson: true,
            ratingAvg: true,
            totalReviews: true,
            consultationPrice: true,
            womenOnlyStaff: true,
            privateSuite: true,
          },
          orderBy: { ratingAvg: 'desc' },
          skip,
          take: input.limit,
        }),
        prisma.vendor.count({ where: where as never }),
      ]);
      return { items, total, page: input.page };
    }),

  /** detail — verified clinic + license fields + approved treatment packages. */
  detail: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ input }) => {
    const clinic = await prisma.vendor.findFirst({
      where: { storeSlug: input.slug, type: 'CLINIC', isVerified: true },
      include: {
        clinicPackages: {
          where: { status: 'APPROVED', isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!clinic) throw new TRPCError({ code: 'NOT_FOUND', message: 'Clinic not found' });

    const { clinicPackages, ...rest } = clinic;
    return { ...rest, packages: clinicPackages };
  }),

  /** slots — open consultation slots in the requested window. */
  slots: publicProcedure
    .input(
      z.object({
        clinicId: z.number().int().positive(),
        from: z.string().datetime(),
        to: z.string().datetime(),
      }),
    )
    .query(async ({ input }) => {
      return prisma.clinicSlot.findMany({
        where: {
          clinicId: input.clinicId,
          isBooked: false,
          startAt: { gte: new Date(input.from) },
          endAt: { lte: new Date(input.to) },
        },
        orderBy: { startAt: 'asc' },
      });
    }),

  /**
   * book — claim an open slot. Medical consent is mandatory: the
   * `consent: true` literal input IS the consent record (consentAcceptedAt).
   */
  book: customerProcedure
    .input(
      z.object({
        slotId: z.number().int().positive(),
        treatmentType: z.enum(TREATMENT_TYPES),
        notes: z.string().max(500).optional(),
        consent: z.literal(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slot = await prisma.clinicSlot.findUnique({
        where: { id: input.slotId },
        include: { clinic: true },
      });
      if (!slot) throw new TRPCError({ code: 'NOT_FOUND', message: 'Slot not found' });
      if (slot.isBooked) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Slot already booked' });
      }
      if (Number(slot.clinic.consultationPrice) <= 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Clinic has not set a consultation price',
        });
      }

      return prisma.$transaction(async (tx) => {
        const claimed = await tx.clinicSlot.updateMany({
          where: { id: input.slotId, isBooked: false },
          data: { isBooked: true },
        });
        if (claimed.count === 0) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Slot already booked' });
        }

        const consultation = await tx.clinicConsultation.create({
          data: {
            code: consultationCode(),
            clinicId: slot.clinicId,
            customerId: ctx.user.id,
            slotId: input.slotId,
            treatmentType: input.treatmentType,
            price: slot.clinic.consultationPrice,
            notes: input.notes,
            consentAcceptedAt: new Date(),
            scheduledAt: slot.startAt,
          },
        });
        await tx.clinicSlot.update({
          where: { id: input.slotId },
          data: { consultationId: consultation.id },
        });
        return consultation;
      });
    }),

  /** myConsultations — the caller's own consultations, newest first. */
  myConsultations: customerProcedure.query(async ({ ctx }) => {
    return prisma.clinicConsultation.findMany({
      where: { customerId: ctx.user.id },
      include: { clinic: { select: { storeName: true, storeSlug: true, logoUrl: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }),

  /** cancel — customer cancels their REQUESTED consultation; slot freed. */
  cancel: customerProcedure
    .input(z.object({ consultationId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const consultation = await prisma.clinicConsultation.findUnique({
        where: { id: input.consultationId },
      });
      if (!consultation || consultation.customerId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Consultation not found' });
      }
      if (consultation.status !== 'REQUESTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only REQUESTED consultations can be cancelled',
        });
      }

      return prisma.$transaction(async (tx) => {
        const updated = await tx.clinicConsultation.update({
          where: { id: input.consultationId },
          data: { status: 'CANCELLED' },
        });
        await tx.clinicSlot.updateMany({
          where: { consultationId: input.consultationId },
          data: { isBooked: false, consultationId: null },
        });
        return updated;
      });
    }),

  /**
   * proposePackage — a clinic proposes a treatment package through the
   * shared B.6 review queue (display-only on the public clinic page).
   */
  proposePackage: customerProcedure
    .input(
      z.object({
        nameAr: z.string().min(2),
        nameEn: z.string().min(2),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        discountPercent: z.number().min(0).max(90).default(15),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'CLINIC') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only clinics can propose treatment packages',
        });
      }

      const pkg = await prisma.beautyPackage.create({
        data: {
          nameJson: { ar: input.nameAr, en: input.nameEn },
          descriptionJson: { ar: input.descriptionAr || '', en: input.descriptionEn || '' },
          discountPercent: input.discountPercent,
          imageUrl: input.imageUrl,
          status: 'PENDING_REVIEW',
          createdByUserId: ctx.user.id,
          clinicId: vendor.id,
        },
      });

      await prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'clinic_package',
          status: 'PENDING_REVIEW',
          payload: { packageId: pkg.id, clinicId: vendor.id, nameJson: pkg.nameJson },
        },
      });

      return pkg;
    }),
});
