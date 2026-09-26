/**
 * 7.3 Observability 2.0 — SLO/SLI surface + incidents.
 *
 * sloStatus and incidents are public so the /status page renders without
 * auth; the counters feed from the requestCounter middleware. Incident
 * management is admin-only.
 */
import { z } from 'zod';
import { publicProcedure, adminMutation, router } from '../trpc';
import { getSloSnapshot } from '../lib/slo';
import { SLO_TARGET_AVAILABILITY, SLO_TARGET_P95_MS } from '@galaxy/shared';
import { prisma } from '@galaxy/db';

export const observabilityRouter = router({
  sloStatus: publicProcedure.query(() => {
    const snap = getSloSnapshot();
    return {
      ...snap,
      targets: { availability: SLO_TARGET_AVAILABILITY, p95Ms: SLO_TARGET_P95_MS },
    };
  }),

  /** Public: open incidents + those resolved in the last 7 days. */
  incidents: publicProcedure.query(async () => {
    const since = new Date(Date.now() - 7 * 86_400_000);
    const [open, recentlyResolved] = await Promise.all([
      prisma.incident.findMany({
        where: { status: 'open' },
        orderBy: { startedAt: 'desc' },
      }),
      prisma.incident.findMany({
        where: { status: 'resolved', resolvedAt: { gte: since } },
        orderBy: { resolvedAt: 'desc' },
      }),
    ]);
    return { open, recentlyResolved };
  }),

  createIncident: adminMutation
    .input(
      z.object({
        titleJson: z.object({ ar: z.string().min(2), en: z.string().min(2) }),
        descriptionJson: z.object({ ar: z.string(), en: z.string() }).optional(),
        severity: z.enum(['minor', 'major', 'critical']).default('minor'),
      }),
    )
    .mutation(async ({ input }) =>
      prisma.incident.create({
        data: {
          titleJson: input.titleJson,
          descriptionJson: input.descriptionJson ?? undefined,
          severity: input.severity,
          status: 'open',
        },
      }),
    ),

  resolveIncident: adminMutation
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) =>
      prisma.incident.update({
        where: { id: input.id },
        data: { status: 'resolved', resolvedAt: new Date() },
      }),
    ),
});
