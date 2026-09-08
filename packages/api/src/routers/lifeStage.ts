import { z } from 'zod';
import { prisma } from '@galaxy/db';
import {
  LIFE_STAGE_KEYS,
  LIFE_STAGES,
  computeCyclePredictions,
  computePregnancy,
  getLifeStageDefinition,
  isPamperWindow,
} from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

const db = prisma;

/** Auto-derivation: bridal concierge → bride; pregnancy mode → pregnant;
 *  cycle tracking → trying; else back to me. Manual override wins. */
async function resolveStage(userId: number): Promise<{ stage: string; source: 'manual' | 'auto' }> {
  const profile = await db.beautyProfile.findUnique({ where: { userId } });
  if (profile?.lifeStage) return { stage: profile.lifeStage, source: 'manual' };

  const [bridal, cycle] = await Promise.all([
    db.bridalConcierge.findUnique({ where: { userId } }),
    db.cycleSettings.findUnique({ where: { userId } }),
  ]);
  if (bridal) return { stage: 'bride', source: 'auto' };
  if (cycle?.pregnancyMode) return { stage: 'pregnant', source: 'auto' };
  if (cycle?.lastPeriodStart) return { stage: 'trying', source: 'auto' };
  return { stage: 'back_to_me', source: 'auto' };
}

/** Services matched to the stage (pregnancy-safe / mommy-friendly / popular). */
function stageServices(stage: string) {
  const where: Record<string, unknown> = { isActive: true };
  if (stage === 'pregnant') where.isPregnancySafe = true;
  else if (stage === 'new_mom') where.isMommyFriendly = true;
  else where.isPopular = true;
  return db.service.findMany({
    where: where as never,
    take: 6,
    orderBy: [{ isPopular: 'desc' }, { id: 'desc' }],
  });
}

export const lifeStageRouter = router({
  /** get — resolved stage (manual override or auto-derivation) + definitions. */
  get: customerProcedure.query(async ({ ctx }) => {
    const { stage, source } = await resolveStage(ctx.user.id);
    return {
      stage,
      source,
      definition: getLifeStageDefinition(stage),
      stages: LIFE_STAGES,
    };
  }),

  /** choose — manual override stored on the beauty profile. */
  choose: customerProcedure
    .input(z.object({ stage: z.enum(LIFE_STAGE_KEYS) }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.beautyProfile.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id, lifeStage: input.stage },
        update: { lifeStage: input.stage },
      });
      return { stage: profile.lifeStage, definition: getLifeStageDefinition(input.stage) };
    }),

  /** home — stage-aware sections for the journey home experience. */
  home: customerProcedure.query(async ({ ctx }) => {
    const { stage, source } = await resolveStage(ctx.user.id);
    const definition = getLifeStageDefinition(stage);

    const [cycle, bridal, services] = await Promise.all([
      db.cycleSettings.findUnique({ where: { userId: ctx.user.id } }),
      db.bridalConcierge.findUnique({ where: { userId: ctx.user.id } }),
      stageServices(stage),
    ]);

    const predictions = computeCyclePredictions({
      cycleLength: cycle?.cycleLength ?? 28,
      lastPeriodStart: cycle?.lastPeriodStart ?? null,
      avgCycleLength: cycle?.avgCycleLength,
    });

    const pregnancy =
      stage === 'pregnant' && cycle?.pregnancyMode && cycle.dueDate
        ? computePregnancy({ dueDate: cycle.dueDate })
        : null;

    return {
      stage,
      source,
      definition,
      links: definition.links,
      cycle: {
        currentDay: predictions.currentDay,
        phase: predictions.phase,
        daysUntilNext: predictions.daysUntilNext,
        nextPeriodDate: predictions.nextPeriodDate,
        isFertileToday: predictions.isFertileToday,
      },
      pregnancy,
      bridal: bridal
        ? {
            weddingDate: bridal.weddingDate,
            status: bridal.status,
            daysUntil: bridal.weddingDate
              ? Math.max(
                  0,
                  Math.round((new Date(bridal.weddingDate).getTime() - Date.now()) / 86_400_000),
                )
              : null,
          }
        : null,
      services,
    };
  }),

  /**
   * pamperStatus — period-pampering window + offers. The window opens when
   * the predicted period is ≤ 3 days away or on period days 1–3; offers
   * (active deals, self-care kits, spa services) surface then.
   */
  pamperStatus: customerProcedure.query(async ({ ctx }) => {
    const cycle = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });
    const predictions = computeCyclePredictions({
      cycleLength: cycle?.cycleLength ?? 28,
      lastPeriodStart: cycle?.lastPeriodStart ?? null,
      avgCycleLength: cycle?.avgCycleLength,
    });
    const window = isPamperWindow({
      daysUntilNext: predictions.daysUntilNext,
      currentDay: predictions.currentDay,
      hasSettings: predictions.hasSettings,
    });

    const now = new Date();
    const [deals, kits, spaServices] = await Promise.all([
      db.flashDeal.findMany({
        where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
        orderBy: { dealPrice: 'asc' },
        take: 4,
      }),
      db.product.findMany({
        where: {
          isActive: true,
          category: { slug: { in: ['product-skincare', 'product-haircare'] } },
        },
        orderBy: { sales: 'desc' },
        take: 4,
      }),
      db.service.findMany({
        where: { isActive: true, category: { slug: 'spa-wellness' } },
        take: 4,
      }),
    ]);

    return {
      isPamperWindow: window,
      daysUntilNext: predictions.daysUntilNext,
      currentDay: predictions.currentDay,
      deals,
      kits,
      spaServices,
    };
  }),
});
