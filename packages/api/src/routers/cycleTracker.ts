import { z } from 'zod';
import { prisma } from '@galaxy/db';
import {
  CYCLE_TRACKER_DAYS,
  CYCLE_PHASES,
  CYCLE_SYMPTOMS,
  PMS_LIBRARY,
  computeCyclePredictions,
  computePregnancy,
} from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

const db = prisma;

const SYMPTOM_SLUGS = CYCLE_SYMPTOMS.map((s) => s.slug);

export const cycleTrackerRouter = router({
  settings: customerProcedure.query(async ({ ctx }) => {
    const s = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });
    return (
      s ?? {
        userId: ctx.user.id,
        cycleLength: 28,
        periodLength: 5,
        lastPeriodStart: null,
        avgCycleLength: null,
        pregnancyMode: false,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  }),

  updateSettings: customerProcedure
    .input(
      z.object({
        cycleLength: z.number().min(20).max(45).optional(),
        periodLength: z.number().min(2).max(10).optional(),
        lastPeriodStart: z.string().optional(),
        pregnancyMode: z.boolean().optional(),
        dueDate: z.string().optional(),
        // E6c — menopause/perimenopause mode flags.
        menopauseMode: z.boolean().optional(),
        lastPeriodAt: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });

      // E4a — when a new period starts, close the previous one with its
      // actual length and learn the average of the last 3 cycles.
      let avgCycleLength = existing?.avgCycleLength ?? null;
      const newStart = input.lastPeriodStart ? new Date(input.lastPeriodStart) : null;
      if (existing?.lastPeriodStart && newStart) {
        const prevLength = Math.max(
          15,
          Math.round((newStart.getTime() - existing.lastPeriodStart.getTime()) / 86_400_000),
        );
        await db.cyclePeriod.create({
          data: { userId: ctx.user.id, startDate: existing.lastPeriodStart, length: prevLength },
        });
        const recent = await db.cyclePeriod.findMany({
          where: { userId: ctx.user.id },
          orderBy: { startDate: 'desc' },
          take: 3,
        });
        const lengths = recent.map((p) => p.length).filter((l): l is number => !!l);
        if (lengths.length >= 2) {
          avgCycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
        }
      }

      return db.cycleSettings.upsert({
        where: { userId: ctx.user.id },
        update: {
          ...(input.cycleLength !== undefined ? { cycleLength: input.cycleLength } : {}),
          ...(input.periodLength !== undefined ? { periodLength: input.periodLength } : {}),
          ...(newStart ? { lastPeriodStart: newStart } : {}),
          ...(input.pregnancyMode !== undefined ? { pregnancyMode: input.pregnancyMode } : {}),
          ...(input.dueDate !== undefined ? { dueDate: new Date(input.dueDate) } : {}),
          ...(avgCycleLength !== null ? { avgCycleLength } : {}),
          ...(input.menopauseMode !== undefined ? { menopauseMode: input.menopauseMode } : {}),
          ...(input.lastPeriodAt !== undefined
            ? { lastPeriodAt: new Date(input.lastPeriodAt) }
            : {}),
        },
        create: {
          userId: ctx.user.id,
          ...(input.cycleLength !== undefined ? { cycleLength: input.cycleLength } : {}),
          ...(input.periodLength !== undefined ? { periodLength: input.periodLength } : {}),
          ...(newStart ? { lastPeriodStart: newStart } : {}),
          ...(input.pregnancyMode !== undefined ? { pregnancyMode: input.pregnancyMode } : {}),
          ...(input.dueDate !== undefined ? { dueDate: new Date(input.dueDate) } : {}),
          ...(avgCycleLength !== null ? { avgCycleLength } : {}),
          ...(input.menopauseMode !== undefined ? { menopauseMode: input.menopauseMode } : {}),
          ...(input.lastPeriodAt !== undefined
            ? { lastPeriodAt: new Date(input.lastPeriodAt) }
            : {}),
        },
      });
    }),

  today: customerProcedure.query(async ({ ctx }) => {
    const settings = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });

    // E4a — pregnancy mode replaces period predictions with a timeline.
    if (settings?.pregnancyMode && settings.dueDate) {
      const { weeksPregnant, trimester } = computePregnancy({ dueDate: settings.dueDate });
      return {
        pregnancyMode: true,
        dueDate: settings.dueDate.toISOString(),
        weeksPregnant,
        trimester,
        hasSettings: true,
      };
    }

    const predictions = computeCyclePredictions({
      cycleLength: settings?.cycleLength ?? 28,
      lastPeriodStart: settings?.lastPeriodStart ?? null,
      avgCycleLength: settings?.avgCycleLength,
    });

    const todayEntry = await db.cycleEntry.findFirst({
      where: { userId: ctx.user.id, dayNumber: predictions.currentDay },
      orderBy: { createdAt: 'desc' },
    });

    const pmsTips = predictions.phase.key === 'luteal' ? PMS_LIBRARY : [];

    return {
      ...predictions,
      periodLength: settings?.periodLength ?? 5,
      pregnancyMode: false,
      todayEntry,
      pmsTips,
      fertileWindow: {
        ovulationDate: predictions.ovulationDate,
        fertileStart: predictions.fertileStart,
        fertileEnd: predictions.fertileEnd,
        isFertileToday: predictions.isFertileToday,
      },
    };
  }),

  logDay: customerProcedure
    .input(
      z.object({
        dayNumber: z.number().min(1).max(45),
        mood: z.string().optional(),
        flowIntensity: z.enum(['light', 'medium', 'heavy', 'spotting']).optional(),
        symptoms: z.array(z.string()).max(10).optional(),
        temperature: z.number().min(34).max(42).optional(),
        beautyNotes: z.string().max(500).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const settings = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });
      // dayNumber is the day-in-cycle (1-45 window) — phase from it.
      const cycleLength = settings?.avgCycleLength ?? settings?.cycleLength ?? 28;
      const adjusted = ((input.dayNumber - 1) % cycleLength) + 1;
      const phase =
        adjusted <= 5
          ? 'menstrual'
          : adjusted <= 13
            ? 'follicular'
            : adjusted <= 16
              ? 'ovulation'
              : 'luteal';

      // Validate symptom slugs against the shared library.
      const symptoms = (input.symptoms ?? []).filter((s) => SYMPTOM_SLUGS.includes(s));

      const existing = await db.cycleEntry.findFirst({
        where: { userId: ctx.user.id, dayNumber: input.dayNumber },
        orderBy: { createdAt: 'desc' },
      });
      const data = {
        phase,
        ...(input.mood !== undefined ? { mood: input.mood } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.flowIntensity !== undefined ? { flowIntensity: input.flowIntensity } : {}),
        ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
        ...(input.beautyNotes !== undefined ? { beautyNotes: input.beautyNotes } : {}),
        symptoms,
      };
      if (existing) return db.cycleEntry.update({ where: { id: existing.id }, data });
      return db.cycleEntry.create({
        data: { userId: ctx.user.id, dayNumber: input.dayNumber, ...data },
      });
    }),

  myEntries: customerProcedure.query(async ({ ctx }) => {
    const entries = await db.cycleEntry.findMany({
      where: { userId: ctx.user.id },
      orderBy: { dayNumber: 'asc' },
      take: CYCLE_TRACKER_DAYS,
    });
    const settings = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });
    const cycleLength = settings?.avgCycleLength ?? settings?.cycleLength ?? 28;
    return { entries, cycleLength, phases: CYCLE_PHASES };
  }),
});
