import { z } from 'zod';
import { prisma } from '@galaxy/db';
import {
  MENOPAUSE_PHASES,
  MENOPAUSE_TIPS,
  MENOPAUSE_SIGNALS,
  MENOPAUSE_SYMPTOMS,
  guessMenopausePhase,
} from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

const db = prisma;

const SYMPTOM_SLUGS = MENOPAUSE_SYMPTOMS.map((s) => s.slug) as [string, ...string[]];

/**
 * E6c — menopause/perimenopause mode (the pregnancy-mode pattern): cycle
 * settings flags + self-reported symptom log + curated content + the
 * verified-clinic tie-in for consultations.
 */
export const menopauseRouter = router({
  /** status — mode state + phase guess from the tracked data. */
  status: customerProcedure.query(async ({ ctx }) => {
    const settings = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });
    return {
      enabled: settings?.menopauseMode ?? false,
      lastPeriodAt: settings?.lastPeriodAt ?? null,
      phase: guessMenopausePhase({ lastPeriodAt: settings?.lastPeriodAt ?? null }),
    };
  }),

  /** setMode — toggle the mode; optionally record the last period date. */
  setMode: customerProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        lastPeriodAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const settings = await db.cycleSettings.upsert({
        where: { userId: ctx.user.id },
        create: {
          userId: ctx.user.id,
          menopauseMode: input.enabled,
          lastPeriodAt: input.lastPeriodAt ? new Date(input.lastPeriodAt) : null,
        },
        update: {
          menopauseMode: input.enabled,
          ...(input.lastPeriodAt ? { lastPeriodAt: new Date(input.lastPeriodAt) } : {}),
        },
      });
      return {
        menopauseMode: settings.menopauseMode,
        lastPeriodAt: settings.lastPeriodAt,
        phase: guessMenopausePhase({ lastPeriodAt: settings.lastPeriodAt }),
      };
    }),

  /** library — phases, self-care tips, when-to-seek-help, symptom slugs. */
  library: customerProcedure.query(() => ({
    phases: MENOPAUSE_PHASES,
    tips: MENOPAUSE_TIPS,
    signals: MENOPAUSE_SIGNALS,
    symptoms: MENOPAUSE_SYMPTOMS,
  })),

  /** logSymptom — self-reported symptom entry (severity 1–3). */
  logSymptom: customerProcedure
    .input(
      z.object({
        symptom: z.enum(SYMPTOM_SLUGS),
        severity: z.number().int().min(1).max(3).default(2),
        notes: z.string().max(300).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      db.menopauseLog.create({
        data: {
          userId: ctx.user.id,
          symptom: input.symptom,
          severity: input.severity,
          notes: input.notes,
        },
      }),
    ),

  /** history — the caller's own symptom log, newest first. */
  history: customerProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(30) }))
    .query(({ ctx, input }) =>
      db.menopauseLog.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      }),
    ),

  /** clinics — verified clinic tie-in for hormone consultations. */
  clinics: customerProcedure.query(() =>
    db.vendor.findMany({
      where: { type: 'CLINIC', isVerified: true, isActive: true },
      select: {
        id: true,
        storeName: true,
        storeSlug: true,
        clinicType: true,
        licenseAgency: true,
        licenseVerifiedAt: true,
        logoUrl: true,
        ratingAvg: true,
      },
      orderBy: { ratingAvg: 'desc' },
      take: 10,
    }),
  ),
});
