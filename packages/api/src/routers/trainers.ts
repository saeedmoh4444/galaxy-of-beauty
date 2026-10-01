/**
 * E3 — TRAINER vertical (audit stage 12). Light parallel flow in the
 * clinic/gym idiom: verified TRAINER vendors offer 1:1 sessions with
 * optional home visits. Money integrity: session price is stamped from
 * the trainer's vendor row (trainerSessionPrice) — the client never
 * supplies price math; a 0 price means "contact for pricing" and books
 * nothing (honest fail-closed).
 */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

function sessionCode(): string {
  return `TRN-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

const trainerSelect = {
  id: true,
  storeName: true,
  storeSlug: true,
  logoUrl: true,
  bannerUrl: true,
  descriptionJson: true,
  trainerSpecialty: true,
  trainerCity: true,
  trainerAddress: true,
  trainerBio: true,
  trainerSessionPrice: true,
  ratingAvg: true,
  totalReviews: true,
  womenOnlyStaff: true,
  privateSuite: true,
} as const;

const TRAINER_SPECIALTIES = ['yoga', 'pilates', 'strength', 'aerobics', 'zumba'] as const;

export const trainersRouter = router({
  /** Verified, active TRAINER vendors (public discovery). */
  list: publicProcedure.query(async () =>
    prisma.vendor.findMany({
      where: { type: 'TRAINER', isVerified: true, isActive: true },
      orderBy: { ratingAvg: 'desc' },
      select: trainerSelect,
    }),
  ),

  /** One trainer by slug — verified + active only, drafts never leak. */
  detail: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ input }) => {
    const trainer = await prisma.vendor.findFirst({
      where: { storeSlug: input.slug, type: 'TRAINER', isVerified: true, isActive: true },
      select: trainerSelect,
    });
    if (!trainer) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Trainer not found' });
    }
    return trainer;
  }),

  /** Book a 1:1 session — price from the vendor row, schedule in the future. */
  bookSession: customerProcedure
    .input(
      z.object({
        trainerId: z.number().int().positive(),
        scheduledAt: z.string().datetime(),
        durationMin: z.number().int().min(30).max(180).default(60),
        isHomeVisit: z.boolean().default(false),
        address: z.string().max(500).optional(),
        notes: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const trainer = await prisma.vendor.findUnique({ where: { id: input.trainerId } });
      if (!trainer || trainer.type !== 'TRAINER' || !trainer.isVerified || !trainer.isActive) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Trainer not available' });
      }
      if (Number(trainer.trainerSessionPrice) <= 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Trainer has no online session price — contact for pricing',
        });
      }
      if (new Date(input.scheduledAt) < new Date()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Schedule must be in the future' });
      }
      if (input.isHomeVisit && !input.address?.trim()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Home visits require an address',
        });
      }

      const session = await prisma.trainerSession.create({
        data: {
          code: sessionCode(),
          trainerId: input.trainerId,
          customerId: ctx.user.id,
          specialty: trainer.trainerSpecialty ?? 'general',
          price: trainer.trainerSessionPrice,
          scheduledAt: new Date(input.scheduledAt),
          durationMin: input.durationMin,
          isHomeVisit: input.isHomeVisit,
          address: input.isHomeVisit ? input.address : null,
          notes: input.notes,
        },
      });
      return session;
    }),

  /** The caller's own sessions, newest first. */
  mySessions: customerProcedure.query(async ({ ctx }) =>
    prisma.trainerSession.findMany({
      where: { customerId: ctx.user.id },
      orderBy: { scheduledAt: 'desc' },
      take: 50,
      include: {
        trainer: { select: { id: true, storeName: true, storeSlug: true, logoUrl: true } },
      },
    }),
  ),

  /** Cancel own open session (REQUESTED/CONFIRMED). */
  cancelSession: customerProcedure
    .input(z.object({ sessionId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const session = await prisma.trainerSession.findFirst({
        where: { id: input.sessionId, customerId: ctx.user.id },
      });
      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }
      if (session.status !== 'REQUESTED' && session.status !== 'CONFIRMED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Session is not cancellable' });
      }
      return prisma.trainerSession.update({
        where: { id: session.id },
        data: { status: 'CANCELLED' },
      });
    }),
});

export { TRAINER_SPECIALTIES };
