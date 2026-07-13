import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../trpc';

// In-memory cache (TTL: 30 seconds)
const cache = new Map<string, { value: boolean; expiresAt: number }>();

export const featureFlagRouter = router({
  // Check if a feature is enabled (public, cached)
  isEnabled: publicProcedure
    .input(z.object({ key: z.string().min(1) }))
    .query(async ({ input }) => {
      const flag = await prisma.featureFlag.findUnique({ where: { key: input.key } });
      if (!flag || !flag.enabled) return { enabled: false };

      // Rollout percentage check
      if (flag.rolloutPercent < 100) {
        return { enabled: flag.rolloutPercent > 0 };
      }

      return { enabled: true, rolloutPercent: flag.rolloutPercent };
    }),

  // Check multiple flags at once
  batch: protectedProcedure
    .input(z.object({ keys: z.array(z.string()) }))
    .query(async ({ input }) => {
      const flags = await prisma.featureFlag.findMany({
        where: { key: { in: input.keys }, enabled: true },
      });
      const result: Record<string, boolean> = {};
      for (const k of input.keys) {
        const f = flags.find((f) => f.key === k);
        result[k] = f ? f.enabled : false;
      }
      return result;
    }),

  // Admin: list all flags
  list: adminProcedure.query(async () => {
    return prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }),

  // Admin: upsert a flag
  upsert: adminProcedure
    .input(z.object({
      key: z.string().min(1), name: z.string(), description: z.string().optional(),
      enabled: z.boolean(), rolloutPercent: z.number().int().min(0).max(100).default(0),
      enabledFor: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const flag = await prisma.featureFlag.upsert({
        where: { key: input.key },
        update: { name: input.name, description: input.description, enabled: input.enabled, rolloutPercent: input.rolloutPercent, enabledFor: input.enabledFor as never },
        create: { key: input.key, name: input.name, description: input.description, enabled: input.enabled, rolloutPercent: input.rolloutPercent, enabledFor: input.enabledFor as never },
      });
      cache.delete(input.key);
      return flag;
    }),

  // Admin: toggle
  toggle: adminProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const flag = await prisma.featureFlag.findUnique({ where: { key: input.key } });
      if (!flag) throw new Error('Flag not found');
      const updated = await prisma.featureFlag.update({
        where: { key: input.key },
        data: { enabled: !flag.enabled },
      });
      cache.delete(input.key);
      return updated;
    }),
});
