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
const SUBMISSION_KINDS = ['package', 'promotion', 'product'] as const;

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
      } else {
        // 'promotion'/'product' kinds land with B.7 and the store plan.
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
