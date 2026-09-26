/**
 * 4.2 A/B testing — client assignment + event tracking.
 *
 * Admins configure tests via adminTools.createAbTest (platformConfig
 * `ab_test:<key>` rows carrying { variantA, variantB, trafficSplit }).
 * This router assigns the current user deterministically (lib/abTest),
 * records impressions/conversions, and reports results.
 */
import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { protectedProcedure, adminProcedure, router } from '../trpc';
import { assignVariant } from '../lib/abTest';

async function readTestConfig(testKey: string) {
  const row = await prisma.platformConfig.findUnique({ where: { key: `ab_test:${testKey}` } });
  if (!row) return null;
  try {
    return JSON.parse(row.value as string) as {
      variantA?: string;
      variantB?: string;
      trafficSplit?: number;
    };
  } catch {
    return null;
  }
}

export const abTestRouter = router({
  /** Deterministic variant assignment + impression. */
  variant: protectedProcedure
    .input(z.object({ testKey: z.string().min(2).max(80) }))
    .query(async ({ ctx, input }) => {
      const config = await readTestConfig(input.testKey);
      const split = config?.trafficSplit ?? 50;
      const variant = assignVariant(ctx.user.id, input.testKey, split);
      // Impression is fire-and-forget; failures must not break the page.
      void prisma.abTestEvent
        .create({
          data: { testKey: input.testKey, variant, eventType: 'impression', userId: ctx.user.id },
        })
        .catch(() => undefined);
      return {
        testKey: input.testKey,
        variant,
        variantLabel: config?.[`variant${variant}`] ?? variant,
      };
    }),

  /** Record a conversion for the variant the user saw. */
  convert: protectedProcedure
    .input(z.object({ testKey: z.string().min(2).max(80), variant: z.enum(['A', 'B']) }))
    .mutation(async ({ ctx, input }) => {
      await prisma.abTestEvent.create({
        data: {
          testKey: input.testKey,
          variant: input.variant,
          eventType: 'conversion',
          userId: ctx.user.id,
        },
      });
      return { success: true };
    }),

  /** Admin results: impressions + conversions + rate per variant. */
  results: adminProcedure
    .input(z.object({ testKey: z.string().min(2).max(80) }))
    .query(async ({ input }) => {
      const rows = await prisma.abTestEvent.findMany({ where: { testKey: input.testKey } });
      const summarize = (variant: string) => {
        const impressions = rows.filter(
          (r) => r.variant === variant && r.eventType === 'impression',
        ).length;
        const conversions = rows.filter(
          (r) => r.variant === variant && r.eventType === 'conversion',
        ).length;
        return {
          variant,
          impressions,
          conversions,
          conversionRate:
            impressions === 0 ? 0 : Math.round((conversions / impressions) * 1000) / 10,
        };
      };
      return { testKey: input.testKey, variants: [summarize('A'), summarize('B')] };
    }),
});
