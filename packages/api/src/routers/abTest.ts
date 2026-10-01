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
import { TRPCError } from '@trpc/server';
import { protectedProcedure, adminProcedure, router } from '../trpc';
import { assignVariant } from '../lib/abTest';
import { abSignificance } from '../lib/abStats';

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
      const variants = [summarize('A'), summarize('B')];
      // Significance math (stage 12) — chi-square with Yates correction.
      const significance = abSignificance(
        { impressions: variants[0]!.impressions, conversions: variants[0]!.conversions },
        { impressions: variants[1]!.impressions, conversions: variants[1]!.conversions },
      );
      return { testKey: input.testKey, variants, significance };
    }),

  /** Admin: all configured tests (stage 12 admin UI). */
  list: adminProcedure.query(async () => {
    const rows = await prisma.platformConfig.findMany({
      where: { key: { startsWith: 'ab_test:' } },
    });
    return rows.map((row) => {
      let config: Record<string, unknown> = {};
      try {
        config = JSON.parse(row.value as string) as Record<string, unknown>;
      } catch {
        config = {};
      }
      return {
        testKey: row.key.slice('ab_test:'.length),
        variantA: config['variantA'] ?? null,
        variantB: config['variantB'] ?? null,
        trafficSplit: config['trafficSplit'] ?? 50,
        winner: config['winner'] ?? null,
        closed: config['closed'] === true,
      };
    });
  }),

  /** Declare the winner — closes the test by pinning the config (stage 12). */
  declareWinner: adminProcedure
    .input(z.object({ testKey: z.string().min(2).max(80), winner: z.enum(['A', 'B']) }))
    .mutation(async ({ input }) => {
      const row = await prisma.platformConfig.findUnique({
        where: { key: `ab_test:${input.testKey}` },
      });
      if (!row) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'A/B test not found' });
      }
      let config: Record<string, unknown> = {};
      try {
        config = JSON.parse(row.value as string) as Record<string, unknown>;
      } catch {
        config = {};
      }
      await prisma.platformConfig.update({
        where: { key: `ab_test:${input.testKey}` },
        data: {
          value: JSON.stringify({ ...config, winner: input.winner, closed: true }),
        },
      });
      return { testKey: input.testKey, winner: input.winner, closed: true };
    }),
});
