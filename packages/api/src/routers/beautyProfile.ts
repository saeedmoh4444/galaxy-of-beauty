import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const beautyProfileRouter = router({
  // Get my beauty profile
  get: customerProcedure.query(async ({ ctx }) => {
    const profile = await prisma.beautyProfile.findUnique({ where: { userId: ctx.user.id } });
    return profile;
  }),

  // Create or update beauty profile
  upsert: customerProcedure
    .input(
      z.object({
        skinType: z.enum(['oily', 'dry', 'combination', 'sensitive', 'normal']).optional(),
        hairType: z.enum(['straight', 'wavy', 'curly', 'coily']).optional(),
        hairLength: z.enum(['short', 'medium', 'long']).optional(),
        skinTone: z.enum(['fair', 'medium', 'olive', 'tan', 'deep']).optional(),
        allergies: z.array(z.string()).optional(),
        preferredScents: z.array(z.string()).optional(),
        makeupStyle: z.enum(['natural', 'glam', 'soft', 'bold']).optional(),
        concerns: z.array(z.string()).optional(),
        notes: z.string().max(1000).optional(),
        // E3 — fitness data feeding trainer recommendations.
        measurements: z
          .object({
            heightCm: z.number().positive().max(250).optional(),
            weightKg: z.number().positive().max(400).optional(),
            waistCm: z.number().positive().max(300).optional(),
            hipCm: z.number().positive().max(300).optional(),
          })
          .optional(),
        fitnessGoals: z.array(z.string().max(50)).max(20).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await prisma.beautyProfile.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id, ...input },
        update: input,
      });
      return profile;
    }),

  // E4b — measurement history. One row per weigh-in/measuring session; the
  // profile's measurements field always carries the latest values.
  logMeasurement: customerProcedure
    .input(
      z
        .object({
          weightKg: z.number().positive().max(400).optional(),
          waistCm: z.number().positive().max(300).optional(),
          hipCm: z.number().positive().max(300).optional(),
          bustCm: z.number().positive().max(300).optional(),
          thighCm: z.number().positive().max(200).optional(),
          bodyFatPct: z.number().positive().max(80).optional(),
          notes: z.string().max(500).optional(),
        })
        .refine(
          (v) =>
            v.weightKg !== undefined ||
            v.waistCm !== undefined ||
            v.hipCm !== undefined ||
            v.bustCm !== undefined ||
            v.thighCm !== undefined ||
            v.bodyFatPct !== undefined,
          { message: 'at least one measurement is required' },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const { notes, ...measurements } = input;
      const log = await prisma.measurementLog.create({
        data: { userId: ctx.user.id, notes, ...measurements },
      });

      // Sync the latest values onto the profile (merge, keep unrelated keys).
      const existing = await prisma.beautyProfile.findUnique({ where: { userId: ctx.user.id } });
      const profile = await prisma.beautyProfile.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id, measurements },
        update: {
          measurements: {
            ...((existing?.measurements as Record<string, unknown> | undefined) ?? {}),
            ...measurements,
          },
        },
      });
      return { ...log, profile };
    }),

  measurementHistory: customerProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(30) }))
    .query(({ ctx, input }) =>
      prisma.measurementLog.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      }),
    ),

  /** E4b — earliest vs latest log per field (progress deltas). */
  measurementProgress: customerProcedure.query(async ({ ctx }) => {
    const logs = await prisma.measurementLog.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'asc' },
    });
    const first = logs[0];
    const latest = logs[logs.length - 1];
    const fields = ['weightKg', 'waistCm', 'hipCm', 'bustCm', 'thighCm', 'bodyFatPct'] as const;
    const progress: Record<string, { first: number; latest: number; delta: number }> = {};
    for (const f of fields) {
      const a = first?.[f];
      const b = latest?.[f];
      if (a != null && b != null)
        progress[f] = { first: a, latest: b, delta: Math.round((b - a) * 100) / 100 };
      else if (b != null) progress[f] = { first: b, latest: b, delta: 0 };
    }
    return { count: logs.length, ...progress };
  }),
});
