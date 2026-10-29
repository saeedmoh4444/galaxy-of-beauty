import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import {
  customerProcedure,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  router,
} from '../trpc';
import { resolveVendorActor } from './vendorPortal';
import { getMediaQueue } from '../queues';

const db = prisma;

/**
 * R1 — surface-link ownership guard (REELS_SHOPPABLE_PLAN). A caller may
 * tag a reel with product/service/vendor ids only within their own
 * surface: vendor owners/staff tag their catalog, verified technicians
 * tag services they provide or their own store. Returns the technician
 * id to stamp (technician callers) or null (vendor callers).
 */
async function resolveShortAuthor(
  userId: number,
  input: { productId?: number; serviceId?: number; vendorId?: number },
): Promise<{ technicianId: number | null; vendorId: number | null }> {
  const technician = await db.technician.findUnique({ where: { userId } });
  const techVerified = technician?.kycStatus === 'VERIFIED';
  const actor = await resolveVendorActor(userId);
  const actorVendorId = actor?.vendor.id ?? null;

  if (!techVerified && !actorVendorId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only verified technicians or store owners can post media',
    });
  }

  // The vendor the caller may tag: vendors tag themselves; store
  // technicians (C5 storeVendorId) tag their store.
  const eligibleVendorId = actorVendorId ?? technician?.storeVendorId ?? null;

  if (input.vendorId !== undefined) {
    if (input.vendorId !== eligibleVendorId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only tag your own store' });
    }
  }

  if (input.productId !== undefined) {
    const product = await db.product.findUnique({ where: { id: input.productId } });
    if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
    if (product.vendorId !== eligibleVendorId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only tag your own products' });
    }
  }

  if (input.serviceId !== undefined) {
    const service = await db.service.findUnique({ where: { id: input.serviceId } });
    if (!service) throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
    if (service.vendorId !== null) {
      // Store service — the store's vendors/technicians may tag it.
      if (service.vendorId !== eligibleVendorId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only tag your own services' });
      }
    } else if (technician) {
      // Platform service — only a technician who provides it may tag it.
      const provides = await db.technicianService.findUnique({
        where: { technicianId_serviceId: { technicianId: technician.id, serviceId: service.id } },
      });
      if (!provides) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Tag only services you provide' });
      }
    } else {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Tag only services you provide' });
    }
  }

  return { technicianId: technician?.id ?? null, vendorId: eligibleVendorId };
}

/**
 * E7 — persisted beauty shorts (reels + before/after). Every upload lands
 * in the moderation queue (isApproved=false); the public feed only shows
 * approved content. Privacy: consent is required on upload and the
 * faceBlurred flag signals the KSA women-only media promise.
 */
export const beautyShortsRouter = router({
  /** feed — approved + active shorts, newest first. Women-only privacy:
   * anonymous callers only see face-blurred shorts. */
  feed: publicProcedure.query(({ ctx }) =>
    db.short.findMany({
      where: {
        isApproved: true,
        isActive: true,
        ...(ctx.user ? {} : { faceBlurred: true }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ),

  /**
   * home — the curated reels row for the public home (Phase 3 sprint 1):
   * approved + active shorts, top by views. Public.
   */
  home: publicProcedure.query(({ ctx }) =>
    db.short.findMany({
      where: {
        isApproved: true,
        isActive: true,
        ...(ctx.user ? {} : { faceBlurred: true }),
      },
      orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    }),
  ),

  /** like — toggles the caller's like on a short. */
  like: customerProcedure
    .input(z.object({ shortId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.shortLike.findUnique({
        where: { shortId_userId: { shortId: input.shortId, userId: ctx.user.id } },
      });
      if (existing) {
        await db.shortLike.delete({ where: { id: existing.id } });
        return { liked: false, shortId: input.shortId };
      }
      await db.shortLike.create({ data: { shortId: input.shortId, userId: ctx.user.id } });
      return { liked: true, shortId: input.shortId };
    }),

  /** viewed — increments the view counter (public). */
  viewed: publicProcedure.input(z.object({ shortId: z.number() })).mutation(async ({ input }) => {
    const updated = await db.short.update({
      where: { id: input.shortId },
      data: { views: { increment: 1 } },
    });
    return { views: updated.views };
  }),

  /**
   * watched — P2 (Phase 2): a watch event fired when a slide loses
   * focus. Seconds are clamped to the reel duration; zero-second
   * events are rejected. Anonymous viewers record userId null.
   */
  watched: publicProcedure
    .input(
      z.object({
        shortId: z.number().int().positive(),
        seconds: z.number().min(0.5).max(3600),
        completed: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const short = await db.short.findUnique({ where: { id: input.shortId } });
      if (!short) throw new TRPCError({ code: 'NOT_FOUND', message: 'Short not found' });

      const seconds = Math.min(Math.round(input.seconds), Math.max(short.durationSec, 1));
      const log = await db.shortWatchLog.create({
        data: {
          shortId: input.shortId,
          userId: ctx.user?.id ?? null,
          seconds,
          completed: input.completed && seconds >= short.durationSec * 0.8,
        },
      });
      return { ok: true, logId: log.id, seconds };
    }),

  /** adminWatchStats — P2: 30-day watch aggregation per short. */
  adminWatchStats: adminProcedure.query(async () => {
    const since = new Date(Date.now() - 30 * 86_400_000);
    const grouped = await db.shortWatchLog.groupBy({
      by: ['shortId'],
      where: { createdAt: { gte: since } },
      _sum: { seconds: true },
      _count: { _all: true },
    });
    const completed = await db.shortWatchLog.groupBy({
      by: ['shortId'],
      where: { createdAt: { gte: since }, completed: true },
      _count: { _all: true },
    });
    const completedByShort = new Map(completed.map((c) => [c.shortId, c._count._all]));

    const shorts = await db.short.findMany({
      where: { id: { in: grouped.map((g) => g.shortId) } },
      select: { id: true, titleJson: true },
    });
    const titleById = new Map(shorts.map((s) => [s.id, s.titleJson]));

    return grouped
      .map((g) => {
        const events = g._count._all;
        const completions = completedByShort.get(g.shortId) ?? 0;
        return {
          id: g.shortId,
          titleJson: titleById.get(g.shortId) ?? {},
          watchSeconds: g._sum.seconds ?? 0,
          events,
          completions,
          completionRate: events > 0 ? completions / events : 0,
        };
      })
      .sort((a, b) => b.watchSeconds - a.watchSeconds)
      .slice(0, 20);
  }),

  /**
   * surfaceShorts — R1 (REELS_SHOPPABLE_PLAN): approved + active shorts
   * attached to a product, a service or a vendor, newest first. The E7
   * privacy rule holds here too (anonymous = face-blurred only).
   */
  surfaceShorts: publicProcedure
    .input(
      z
        .object({
          productId: z.number().int().positive().optional(),
          serviceId: z.number().int().positive().optional(),
          vendorId: z.number().int().positive().optional(),
        })
        .refine(
          (v) => v.productId !== undefined || v.serviceId !== undefined || v.vendorId !== undefined,
          {
            message: 'Provide productId, serviceId or vendorId',
          },
        ),
    )
    .query(({ ctx, input }) =>
      db.short.findMany({
        where: {
          isApproved: true,
          isActive: true,
          ...(ctx.user ? {} : { faceBlurred: true }),
          ...(input.productId !== undefined ? { productId: input.productId } : {}),
          ...(input.serviceId !== undefined ? { serviceId: input.serviceId } : {}),
          ...(input.vendorId !== undefined ? { vendorId: input.vendorId } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
    ),

  /**
   * create — verified technicians post shorts. Consent is mandatory and
   * the post goes straight to the moderation queue.
   */
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(['reel', 'before_after']),
        titleAr: z.string().min(2).max(120),
        titleEn: z.string().min(2).max(120),
        videoUrl: z.string().url().optional(),
        thumbnailUrl: z.string().url().optional(),
        beforeImageUrl: z.string().url().optional(),
        durationSec: z.number().int().min(0).max(600).default(0),
        category: z.string().min(2).max(40).default('general'),
        faceBlurred: z.boolean().default(false),
        consent: z.literal(true, 'consent is required to publish media'),
        // R1 — optional surface attachments (ownership-guarded).
        productId: z.number().int().positive().optional(),
        serviceId: z.number().int().positive().optional(),
        vendorId: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const author = await resolveShortAuthor(ctx.user.id, input);

      // R2 — 10 active reels per author; the cap keeps storage/egress
      // costs bounded and nudges quality over volume.
      const activeReels = await db.short.count({
        where: {
          type: 'reel',
          isActive: true,
          ...(author.technicianId !== null
            ? { technicianId: author.technicianId }
            : { vendorId: author.vendorId ?? undefined }),
        },
      });
      if (activeReels >= 10) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Reel quota reached (10 active reels)' });
      }

      const created = await db.short.create({
        data: {
          type: input.type,
          technicianId: author.technicianId,
          vendorId: input.vendorId,
          titleJson: { ar: input.titleAr, en: input.titleEn },
          videoUrl: input.videoUrl,
          thumbnailUrl: input.thumbnailUrl,
          beforeImageUrl: input.beforeImageUrl,
          durationSec: input.durationSec,
          category: input.category,
          faceBlurred: input.faceBlurred,
          consentGiven: true,
          isApproved: false,
          productId: input.productId,
          serviceId: input.serviceId,
        },
      });

      // R3 — enqueue the media pipeline (ffprobe duration + ffmpeg
      // poster). Fire-and-forget with exponential retries; the handler
      // degrades gracefully when the binaries are absent.
      if (created.videoUrl) {
        const mediaQueue = getMediaQueue();
        void mediaQueue?.add(
          'media.process-short',
          { shortId: created.id },
          { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
        );
      }

      return created;
    }),

  /**
   * gallery — E6e: approved before/after shorts (by USER id), surfaced on
   * the technician profile/gallery pages and merged across all of a
   * service's mapped technicians on the service detail page. Public.
   * Pass one of `technicianUserId` or `technicianUserIds` (max 10).
   */
  gallery: publicProcedure
    .input(
      z
        .object({
          technicianUserId: z.number().int().positive().optional(),
          technicianUserIds: z.array(z.number().int().positive()).max(10).optional(),
        })
        .refine((v) => v.technicianUserId !== undefined || v.technicianUserIds !== undefined, {
          message: 'Provide technicianUserId or technicianUserIds',
        }),
    )
    .query(async ({ input }) => {
      const userIds =
        input.technicianUserIds ?? (input.technicianUserId ? [input.technicianUserId] : []);
      if (userIds.length === 0) return [];
      const technicians = await db.technician.findMany({
        where: { userId: { in: userIds } },
        select: { id: true },
      });
      if (technicians.length === 0) return [];
      return db.short.findMany({
        where: {
          technicianId: { in: technicians.map((t) => t.id) },
          type: 'before_after',
          isApproved: true,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      });
    }),

  /** myShorts — the caller's own posts with their moderation status. */
  myShorts: protectedProcedure.query(async ({ ctx }) => {
    const technician = await db.technician.findUnique({ where: { userId: ctx.user.id } });
    if (technician) {
      return db.short.findMany({
        where: { technicianId: technician.id },
        orderBy: { createdAt: 'desc' },
      });
    }
    // R6 — vendor owners/staff see their store reels (moderation status).
    const actor = await resolveVendorActor(ctx.user.id);
    if (actor) {
      return db.short.findMany({
        where: { vendorId: actor.vendor.id },
        orderBy: { createdAt: 'desc' },
      });
    }
    return [];
  }),

  /**
   * report — R6 (REELS_SHOPPABLE_PLAN): one report per user per short;
   * three distinct reports auto-hide the short pending admin review.
   */
  report: customerProcedure
    .input(
      z.object({
        shortId: z.number().int().positive(),
        reason: z.enum(['inappropriate', 'spam', 'privacy', 'other']),
        note: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const short = await db.short.findUnique({ where: { id: input.shortId } });
      if (!short) throw new TRPCError({ code: 'NOT_FOUND', message: 'Short not found' });

      const existing = await db.shortReport.findUnique({
        where: { shortId_userId: { shortId: input.shortId, userId: ctx.user.id } },
      });
      if (!existing) {
        await db.shortReport.create({
          data: {
            shortId: input.shortId,
            userId: ctx.user.id,
            reason: input.reason,
            note: input.note,
          },
        });
      }

      const reportCount = await db.shortReport.count({ where: { shortId: input.shortId } });
      let hidden = false;
      if (reportCount >= 3) {
        await db.short.update({ where: { id: input.shortId }, data: { isActive: false } });
        hidden = true;
      }
      return { reportCount, hidden, alreadyReported: Boolean(existing) };
    }),

  /** adminReports — R6: reported shorts with counts + reasons for review. */
  adminReports: adminProcedure.query(async () => {
    const shorts = await db.short.findMany({
      where: { reports: { some: {} } },
      include: {
        reports: { select: { reason: true } },
        _count: { select: { reports: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return shorts.map((s) => ({
      id: s.id,
      titleJson: s.titleJson,
      isActive: s.isActive,
      hidden: !s.isActive,
      isApproved: s.isApproved,
      reportCount: s._count.reports,
      reasons: Array.from(new Set(s.reports.map((r) => r.reason))),
    }));
  }),

  /** adminPending — the moderation queue (unapproved posts). */
  adminPending: adminProcedure.query(() =>
    db.short.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'asc' },
    }),
  ),

  /** adminDecide — approve (goes live) or reject (hidden). */
  adminDecide: adminProcedure
    .input(z.object({ shortId: z.number(), approve: z.boolean() }))
    .mutation(async ({ input }) => {
      const short = await db.short.findUnique({ where: { id: input.shortId } });
      if (!short) throw new TRPCError({ code: 'NOT_FOUND', message: 'Short not found' });
      return db.short.update({
        where: { id: input.shortId },
        data: { isApproved: input.approve, isActive: input.approve },
      });
    }),
});
