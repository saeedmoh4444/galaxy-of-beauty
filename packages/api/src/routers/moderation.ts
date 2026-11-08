import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { router, customerProcedure, adminProcedure } from '../trpc';
import { matchesBlocklist } from '../lib/moderationBlocklist';

/**
 * A2 — unified moderation (PLATFORM_IMPROVEMENT_PLAN).
 *
 * One report per reporter per target across every UGC surface except
 * shorts (dedicated ShortReport flow). Reports land in an admin queue
 * with a content preview; resolving applies dismiss / hide / remove /
 * hide_and_suspend. Blocklist matches auto-action at report time
 * (autoAction) so the queue history still shows what happened.
 */

const TARGET_TYPES = [
  'review',
  'community_post',
  'community_comment',
  'beauty_post',
  'beauty_post_comment',
  'gallery_image',
  'product_review',
] as const;

type TargetType = (typeof TARGET_TYPES)[number];

const targetTypeSchema = z.enum(TARGET_TYPES);
const reasonSchema = z.enum(['inappropriate', 'spam', 'privacy', 'other']);
const decisionSchema = z.enum(['dismiss', 'hide', 'remove', 'hide_and_suspend']);

/** Per-type fetch → { exists, text, authorId, isHidden } for validation + triage. */
async function loadTarget(type: TargetType, id: number) {
  switch (type) {
    case 'review': {
      const row = await prisma.review.findUnique({ where: { id } });
      return row
        ? {
            exists: true as const,
            text: row.comment ?? '',
            authorId: row.customerId,
            isHidden: !row.isVisible,
          }
        : { exists: false as const };
    }
    case 'community_post': {
      const row = await prisma.communityPost.findUnique({ where: { id } });
      return row
        ? { exists: true as const, text: row.content, authorId: row.userId, isHidden: row.isHidden }
        : { exists: false as const };
    }
    case 'community_comment': {
      const row = await prisma.communityComment.findUnique({ where: { id } });
      return row
        ? { exists: true as const, text: row.content, authorId: row.userId, isHidden: row.isHidden }
        : { exists: false as const };
    }
    case 'beauty_post': {
      const row = await prisma.beautyPost.findUnique({ where: { id } });
      return row
        ? {
            exists: true as const,
            text: row.caption ?? '',
            authorId: row.userId,
            isHidden: !row.isApproved,
          }
        : { exists: false as const };
    }
    case 'beauty_post_comment': {
      const row = await prisma.beautyPostComment.findUnique({ where: { id } });
      return row
        ? { exists: true as const, text: row.content, authorId: row.userId, isHidden: row.isHidden }
        : { exists: false as const };
    }
    case 'gallery_image': {
      const row = await prisma.galleryImage.findUnique({ where: { id } });
      const caption =
        row?.captionJson && typeof row.captionJson === 'object'
          ? Object.values(row.captionJson as Record<string, unknown>).join(' ')
          : '';
      return row
        ? {
            exists: true as const,
            text: caption,
            authorId: row.technicianId,
            isHidden: !row.isPublished,
          }
        : { exists: false as const };
    }
    case 'product_review': {
      const row = await prisma.productReview.findUnique({ where: { id } });
      return row
        ? {
            exists: true as const,
            text: row.comment ?? '',
            authorId: row.userId,
            isHidden: row.isHidden,
          }
        : { exists: false as const };
    }
  }
}

/** Per-type hide: the "hidden" flag differs per surface. */
async function hideTarget(type: TargetType, id: number) {
  switch (type) {
    case 'review':
      await prisma.review.update({ where: { id }, data: { isVisible: false } });
      return;
    case 'community_post':
      await prisma.communityPost.update({ where: { id }, data: { isHidden: true } });
      return;
    case 'community_comment':
      await prisma.communityComment.update({ where: { id }, data: { isHidden: true } });
      return;
    case 'beauty_post':
      await prisma.beautyPost.update({ where: { id }, data: { isApproved: false } });
      return;
    case 'beauty_post_comment':
      await prisma.beautyPostComment.update({ where: { id }, data: { isHidden: true } });
      return;
    case 'gallery_image':
      await prisma.galleryImage.update({ where: { id }, data: { isPublished: false } });
      return;
    case 'product_review':
      await prisma.productReview.update({ where: { id }, data: { isHidden: true } });
      return;
  }
}

/** Per-type hard delete — the admin's nuclear option. */
async function removeTarget(type: TargetType, id: number) {
  switch (type) {
    case 'review':
      await prisma.review.delete({ where: { id } });
      return;
    case 'community_post':
      await prisma.communityPost.delete({ where: { id } });
      return;
    case 'community_comment':
      await prisma.communityComment.delete({ where: { id } });
      return;
    case 'beauty_post':
      await prisma.beautyPost.delete({ where: { id } });
      return;
    case 'beauty_post_comment':
      await prisma.beautyPostComment.delete({ where: { id } });
      return;
    case 'gallery_image':
      await prisma.galleryImage.delete({ where: { id } });
      return;
    case 'product_review':
      await prisma.productReview.delete({ where: { id } });
      return;
  }
}

export const moderationRouter = router({
  /**
   * report — one open report per reporter per target. Blocklist matches
   * auto-hide the target (autoAction) instead of queueing for a human.
   */
  report: customerProcedure
    .input(
      z.object({
        targetType: targetTypeSchema,
        targetId: z.number().int().positive(),
        reason: reasonSchema,
        note: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const target = await loadTarget(input.targetType, input.targetId);
      if (!target.exists) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reported content not found' });
      }

      const existing = await prisma.contentReport.findUnique({
        where: {
          targetType_targetId_reporterId: {
            targetType: input.targetType,
            targetId: input.targetId,
            reporterId: ctx.user.id,
          },
        },
      });
      if (existing) {
        return { reportId: existing.id, alreadyReported: true, autoAction: false };
      }

      const auto = matchesBlocklist(target.text);
      const report = await prisma.contentReport.create({
        data: {
          targetType: input.targetType,
          targetId: input.targetId,
          reporterId: ctx.user.id,
          reason: input.reason,
          note: input.note,
          status: auto ? 'actioned' : 'open',
          action: auto ? 'hidden' : null,
          autoAction: auto,
          handledAt: auto ? new Date() : null,
        },
      });
      if (auto) {
        await hideTarget(input.targetType, input.targetId);
      }
      return { reportId: report.id, alreadyReported: false, autoAction: auto };
    }),

  /** myReports — the caller's own reports, newest first. */
  myReports: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const items = await prisma.contentReport.findMany({
        where: { reporterId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: input?.limit ?? 20,
      });
      return { items };
    }),

  /**
   * queue — open reports with a per-type preview, the reporter's name,
   * and how many open reports the target accumulated.
   */
  queue: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(async ({ input }) => {
      const reports = await prisma.contentReport.findMany({
        where: { status: 'open' },
        orderBy: { createdAt: 'asc' },
        take: input?.limit ?? 50,
        include: { reporter: { select: { name: true } } },
      });

      // Batch-fetch previews per type (one query per type, not N+1).
      const byType = new Map<TargetType, number[]>();
      for (const r of reports) byType.set(r.targetType as TargetType, []);
      for (const r of reports) byType.get(r.targetType as TargetType)!.push(r.targetId);

      const previews = new Map<string, { preview: string; authorName: string | null }>();
      for (const [type, ids] of byType) {
        if (!ids.length) continue;
        const rows = await loadPreviews(type, ids);
        for (const row of rows) previews.set(`${type}:${row.id}`, row);
      }

      const items = reports.map((r) => {
        const p = previews.get(`${r.targetType}:${r.targetId}`);
        return {
          id: r.id,
          targetType: r.targetType,
          targetId: r.targetId,
          reason: r.reason,
          note: r.note,
          status: r.status,
          createdAt: r.createdAt,
          reporterName: r.reporter.name,
          preview: p?.preview ?? '',
          authorName: p?.authorName,
        };
      });
      return { items };
    }),

  /**
   * resolve — one decision closes ALL open reports on the target.
   * hide: flag the target; remove: delete it; hide_and_suspend: hide +
   * suspend the author; dismiss: no action on the content.
   */
  resolve: adminProcedure
    .input(
      z.object({
        reportId: z.number().int().positive(),
        decision: decisionSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const report = await prisma.contentReport.findUnique({ where: { id: input.reportId } });
      if (!report) throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
      if (report.status !== 'open') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Report already resolved' });
      }

      const type = report.targetType as TargetType;
      const target = await loadTarget(type, report.targetId);
      if (!target.exists && input.decision !== 'dismiss') {
        // Target already gone (e.g. removed via another report) — close out.
        const closed = await prisma.contentReport.updateMany({
          where: { targetType: type, targetId: report.targetId, status: 'open' },
          data: { status: 'dismissed', handledById: ctx.user.id, handledAt: new Date() },
        });
        return { closed: closed.count };
      }

      if (input.decision === 'hide' || input.decision === 'hide_and_suspend') {
        await hideTarget(type, report.targetId);
      } else if (input.decision === 'remove') {
        await removeTarget(type, report.targetId);
      }

      if (input.decision === 'hide_and_suspend') {
        await prisma.user.update({
          where: { id: target.authorId },
          data: {
            suspendedAt: new Date(),
            suspendReason: `content_moderation:${type}:${report.targetId}`,
          },
        });
      }

      const action =
        input.decision === 'dismiss'
          ? null
          : input.decision === 'hide'
            ? 'hidden'
            : input.decision === 'remove'
              ? 'removed'
              : 'user_suspended';

      const closed = await prisma.contentReport.updateMany({
        where: { targetType: type, targetId: report.targetId, status: 'open' },
        data: {
          status: input.decision === 'dismiss' ? 'dismissed' : 'actioned',
          action,
          handledById: ctx.user.id,
          handledAt: new Date(),
        },
      });
      return { closed: closed.count };
    }),
});

/** Batch preview fetch per type — one query per type, not per report. */
async function loadPreviews(
  type: TargetType,
  ids: number[],
): Promise<Array<{ id: number; preview: string; authorName: string | null }>> {
  switch (type) {
    case 'review': {
      const rows = await prisma.review.findMany({
        where: { id: { in: ids } },
        select: { id: true, comment: true, customer: { select: { name: true } } },
      });
      return rows.map((r) => ({ id: r.id, preview: r.comment ?? '', authorName: r.customer.name }));
    }
    case 'community_post': {
      const rows = await prisma.communityPost.findMany({
        where: { id: { in: ids } },
        select: { id: true, content: true, userId: true },
      });
      const names = await namesFor(rows.map((r) => r.userId));
      return rows.map((r) => ({
        id: r.id,
        preview: r.content,
        authorName: names.get(r.userId) ?? null,
      }));
    }
    case 'community_comment': {
      const rows = await prisma.communityComment.findMany({
        where: { id: { in: ids } },
        select: { id: true, content: true, userId: true },
      });
      const names = await namesFor(rows.map((r) => r.userId));
      return rows.map((r) => ({
        id: r.id,
        preview: r.content,
        authorName: names.get(r.userId) ?? null,
      }));
    }
    case 'beauty_post': {
      const rows = await prisma.beautyPost.findMany({
        where: { id: { in: ids } },
        select: { id: true, caption: true, userId: true },
      });
      const names = await namesFor(rows.map((r) => r.userId));
      return rows.map((r) => ({
        id: r.id,
        preview: r.caption ?? '',
        authorName: names.get(r.userId) ?? null,
      }));
    }
    case 'beauty_post_comment': {
      const rows = await prisma.beautyPostComment.findMany({
        where: { id: { in: ids } },
        select: { id: true, content: true, userId: true },
      });
      const names = await namesFor(rows.map((r) => r.userId));
      return rows.map((r) => ({
        id: r.id,
        preview: r.content,
        authorName: names.get(r.userId) ?? null,
      }));
    }
    case 'gallery_image': {
      const rows = await prisma.galleryImage.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          captionJson: true,
          technician: { select: { user: { select: { name: true } } } },
        },
      });
      return rows.map((r) => {
        const caption =
          r.captionJson && typeof r.captionJson === 'object'
            ? Object.values(r.captionJson as Record<string, unknown>).join(' ')
            : '';
        return { id: r.id, preview: caption, authorName: r.technician?.user.name ?? null };
      });
    }
    case 'product_review': {
      const rows = await prisma.productReview.findMany({
        where: { id: { in: ids } },
        select: { id: true, comment: true, user: { select: { name: true } } },
      });
      return rows.map((r) => ({ id: r.id, preview: r.comment ?? '', authorName: r.user.name }));
    }
  }
}

async function namesFor(userIds: number[]): Promise<Map<number, string>> {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  return new Map(users.map((u) => [u.id, u.name]));
}
