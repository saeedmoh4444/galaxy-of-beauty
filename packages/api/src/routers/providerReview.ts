/**
 * B.6/B.7 — generic provider submission review queue (the KYC-review
 * pattern). One queue consumed by: package proposals (B.6), tech promotions
 * (B.7), vendor products (later). Admin approves/rejects with notes; the
 * provider is notified either way through the B.26 framework.
 */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import { adminProcedure, router } from '../trpc';
import { notifyUser } from '../lib/notify';

const SUBMISSION_STATUSES = ['PENDING_REVIEW', 'APPROVED', 'REJECTED'] as const;
const SUBMISSION_KINDS = [
  'package',
  'promotion',
  'store',
  'store_promotion',
  'product',
  'clinic',
  'clinic_package',
  'gym',
  'nail_bar',
  'athome_salon',
] as const;

export const providerReviewRouter = router({
  list: adminProcedure
    .input(
      z.object({
        kind: z.enum(SUBMISSION_KINDS).optional(),
        status: z.enum(SUBMISSION_STATUSES).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ input }) => {
      const where: Record<string, string> = {};
      if (input.kind) where['kind'] = input.kind;
      if (input.status) where['status'] = input.status;
      const skip = (input.page - 1) * input.limit;

      const [items, total] = await Promise.all([
        prisma.providerSubmission.findMany({
          where,
          orderBy: { createdAt: 'asc' }, // oldest first — FIFO review
          skip,
          take: input.limit,
        }),
        prisma.providerSubmission.count({ where }),
      ]);

      return { items, total, page: input.page };
    }),

  /**
   * decide — approve or reject a submission. kind 'package' materializes
   * the decision onto the BeautyPackage row (APPROVED/REJECTED + notes).
   * Other kinds (B.7 promotions) will be handled here as they land.
   */
  decide: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        approve: z.boolean(),
        notes: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const submission = await prisma.providerSubmission.findUnique({
        where: { id: input.id },
      });
      if (!submission) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
      }
      if (submission.status !== 'PENDING_REVIEW') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Submission already decided' });
      }

      const newStatus = input.approve ? 'APPROVED' : 'REJECTED';

      // Materialize per kind.
      let subjectName = '';
      if (submission.kind === 'package') {
        const payload = submission.payload as { packageId: number; nameJson?: { ar?: string } };
        const pkg = await prisma.beautyPackage.findUnique({
          where: { id: payload.packageId },
        });
        if (!pkg) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Package missing' });
        }
        await prisma.beautyPackage.update({
          where: { id: pkg.id },
          data: {
            status: newStatus,
            reviewNotes: input.approve ? null : (input.notes ?? null),
            reviewedBy: ctx.user.id,
            reviewedAt: new Date(),
          },
        });
        subjectName = ((payload.nameJson as { ar?: string })?.ar ?? '') || `باقة #${pkg.id}`;
      } else if (submission.kind === 'promotion') {
        // B.7 — approved promotions become FlashDeal rows (they appear in
        // the existing public flashDeals feed). Rejected → nothing created.
        const payload = submission.payload as {
          serviceId: number;
          titleAr?: string;
          titleEn?: string;
          originalPrice: number;
          dealPrice: number;
          startsAt: string;
          endsAt: string;
        };
        subjectName = payload.titleAr ? `عرض ${payload.titleAr}` : `عرض #${submission.id}`;
        if (input.approve) {
          const originalPrice = Number(payload.originalPrice);
          const dealPrice = Number(payload.dealPrice);
          const discountValue = Math.round((originalPrice - dealPrice) * 100) / 100;
          const discountPercent =
            originalPrice > 0 ? Math.round((discountValue / originalPrice) * 100) : 0;
          await prisma.flashDeal.create({
            data: {
              serviceId: payload.serviceId,
              titleAr: payload.titleAr,
              titleEn: payload.titleEn,
              discountPercent,
              originalPrice,
              dealPrice,
              discountValue,
              maxRedemptions: 20,
              currentRedemptions: 0,
              startsAt: new Date(payload.startsAt),
              endsAt: new Date(payload.endsAt),
              isActive: true,
            },
          });
        }
      } else if (submission.kind === 'store') {
        // Store plan Phase 1 — merchant registration. Approve flips the
        // vendor to verified (public listings + product visibility).
        const payload = submission.payload as { vendorId: number; storeName?: string };
        const vendor = await prisma.vendor.findUnique({ where: { id: payload.vendorId } });
        if (!vendor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Store missing' });
        }
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            isVerified: input.approve,
            isActive: input.approve ? vendor.isActive : false,
          },
        });
        subjectName = payload.storeName ?? `متجر #${vendor.id}`;
      } else if (submission.kind === 'store_promotion') {
        // Store plan Phase 4b — approved deals materialize as StoreDeal
        // rows + the product's comparePrice (the "was" price) so the
        // public listing shows the strike-through.
        const payload = submission.payload as {
          productId: number;
          titleAr?: string;
          originalPrice: number;
          dealPrice: number;
          startsAt: string;
          endsAt: string;
        };
        subjectName = payload.titleAr ? `عرض ${payload.titleAr}` : `عرض #${submission.id}`;
        if (input.approve) {
          const product = await prisma.product.findUnique({
            where: { id: payload.productId },
            select: { vendorId: true },
          });
          if (!product) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Product missing' });
          }
          await prisma.$transaction([
            prisma.storeDeal.create({
              data: {
                productId: payload.productId,
                vendorId: product.vendorId,
                originalPrice: payload.originalPrice,
                dealPrice: payload.dealPrice,
                startsAt: new Date(payload.startsAt),
                endsAt: new Date(payload.endsAt),
                isActive: true,
              },
            }),
            prisma.product.update({
              where: { id: payload.productId },
              data: { comparePrice: payload.originalPrice },
            }),
          ]);
        }
      } else if (submission.kind === 'clinic') {
        // E2 — medical clinic registration. Approve flips the clinic to
        // verified and stamps the license-verification date (trust badge).
        const payload = submission.payload as { vendorId: number; clinicName?: string };
        const vendor = await prisma.vendor.findUnique({ where: { id: payload.vendorId } });
        if (!vendor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Clinic missing' });
        }
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            isVerified: input.approve,
            isActive: input.approve ? vendor.isActive : false,
            licenseVerifiedAt: input.approve ? new Date() : null,
          },
        });
        subjectName = payload.clinicName ?? `عيادة #${vendor.id}`;
      } else if (submission.kind === 'clinic_package') {
        // E2 — clinic treatment packages (display-only, B.6 machinery).
        const payload = submission.payload as { packageId: number; nameJson?: { ar?: string } };
        const pkg = await prisma.beautyPackage.findUnique({
          where: { id: payload.packageId },
        });
        if (!pkg) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Package missing' });
        }
        await prisma.beautyPackage.update({
          where: { id: pkg.id },
          data: {
            status: newStatus,
            reviewNotes: input.approve ? null : (input.notes ?? null),
            reviewedBy: ctx.user.id,
            reviewedAt: new Date(),
          },
        });
        subjectName = ((payload.nameJson as { ar?: string })?.ar ?? '') || `باقة #${pkg.id}`;
      } else if (submission.kind === 'gym') {
        // E3 — gym registration. Approve flips to verified + stamps the
        // license-verification date (same trust badge as clinics).
        const payload = submission.payload as { vendorId: number; gymName?: string };
        const vendor = await prisma.vendor.findUnique({ where: { id: payload.vendorId } });
        if (!vendor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Gym missing' });
        }
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            isVerified: input.approve,
            isActive: input.approve ? vendor.isActive : false,
            licenseVerifiedAt: input.approve ? new Date() : null,
          },
        });
        subjectName = payload.gymName ?? `نادي #${vendor.id}`;
      } else if (submission.kind === 'nail_bar') {
        // E5 — nail bar registration. Same verified + license stamp flow.
        const payload = submission.payload as { vendorId: number; nailBarName?: string };
        const vendor = await prisma.vendor.findUnique({ where: { id: payload.vendorId } });
        if (!vendor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Nail bar missing' });
        }
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            isVerified: input.approve,
            isActive: input.approve ? vendor.isActive : false,
            licenseVerifiedAt: input.approve ? new Date() : null,
          },
        });
        subjectName = payload.nailBarName ?? `صالون أظافر #${vendor.id}`;
      } else if (submission.kind === 'athome_salon') {
        // E5 — at-home salon registration. Verified providers receive
        // homeService requests covering their city.
        const payload = submission.payload as { vendorId: number; salonName?: string };
        const vendor = await prisma.vendor.findUnique({ where: { id: payload.vendorId } });
        if (!vendor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'At-home salon missing' });
        }
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            isVerified: input.approve,
            isActive: input.approve ? vendor.isActive : false,
            licenseVerifiedAt: input.approve ? new Date() : null,
          },
        });
        subjectName = payload.salonName ?? `صالون منزلي #${vendor.id}`;
      } else {
        // 'product' kind lands with the store plan.
        subjectName = `${submission.kind} #${submission.id}`;
      }

      const updated = await prisma.providerSubmission.update({
        where: { id: submission.id },
        data: {
          status: newStatus,
          reviewNotes: input.notes ?? null,
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
        },
      });

      // Provider notification (fire-and-forget).
      try {
        const provider = await prisma.user.findUnique({
          where: { id: submission.providerId },
          select: { name: true },
        });
        await notifyUser({
          userId: submission.providerId,
          templateKey: input.approve ? 'submission_approved' : 'submission_rejected',
          vars: {
            providerName: provider?.name ?? '',
            subjectName,
            reason: !input.approve && input.notes ? ` السبب: ${input.notes}` : '',
          },
        });
      } catch {
        // Notification failure must never fail the decision.
      }

      return updated;
    }),
});
