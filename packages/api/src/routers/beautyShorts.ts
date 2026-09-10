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

const db = prisma;

/**
 * E7 — persisted beauty shorts (reels + before/after). Every upload lands
 * in the moderation queue (isApproved=false); the public feed only shows
 * approved content. Privacy: consent is required on upload and the
 * faceBlurred flag signals the KSA women-only media promise.
 */
export const beautyShortsRouter = router({
  /** feed — approved + active shorts, newest first (public). */
  feed: publicProcedure.query(() =>
    db.short.findMany({
      where: { isApproved: true, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ),

  /**
   * home — the curated reels row for the public home (Phase 3 sprint 1):
   * approved + active shorts, top by views. Public.
   */
  home: publicProcedure.query(() =>
    db.short.findMany({
      where: { isApproved: true, isActive: true },
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
        consent: z.literal(true, {
          errorMap: () => ({ message: 'consent is required to publish media' }),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const technician = await db.technician.findUnique({ where: { userId: ctx.user.id } });
      if (!technician || technician.kycStatus !== 'VERIFIED') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only verified technicians can post media',
        });
      }

      return db.short.create({
        data: {
          type: input.type,
          technicianId: technician.id,
          titleJson: { ar: input.titleAr, en: input.titleEn },
          videoUrl: input.videoUrl,
          thumbnailUrl: input.thumbnailUrl,
          beforeImageUrl: input.beforeImageUrl,
          durationSec: input.durationSec,
          category: input.category,
          faceBlurred: input.faceBlurred,
          consentGiven: true,
          isApproved: false,
        },
      });
    }),

  /**
   * gallery — E6e: a technician's approved before/after shorts (by USER id),
   * surfaced on the technician profile/gallery pages. Public.
   */
  gallery: publicProcedure
    .input(z.object({ technicianUserId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const technician = await db.technician.findUnique({
        where: { userId: input.technicianUserId },
      });
      if (!technician) return [];
      return db.short.findMany({
        where: {
          technicianId: technician.id,
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
    if (!technician) return [];
    return db.short.findMany({
      where: { technicianId: technician.id },
      orderBy: { createdAt: 'desc' },
    });
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
