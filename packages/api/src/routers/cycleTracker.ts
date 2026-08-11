import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { CYCLE_TRACKER_DAYS } from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const PHASES = [
  {
    key: 'menstrual',
    emoji: '🩸',
    name: 'الدورة',
    days: [1, 5],
    color: '#ec4899',
    tips: ['تجنبي إزالة الشعر بالشمع', 'البشرة حساسة — رطبي بلطف', 'تجنبي العلاجات القوية'],
  },
  {
    key: 'follicular',
    emoji: '🌸',
    name: 'الجريبي',
    days: [6, 13],
    color: '#f59e0b',
    tips: [
      'أفضل وقت لتجربة منتجات جديدة',
      'البشرة متقبلة للعلاج',
      'الشعر ينمو أسرع — وقت مثالي للقص',
    ],
  },
  {
    key: 'ovulation',
    emoji: '✨',
    name: 'الإباضة',
    days: [14, 16],
    color: '#8b5cf6',
    tips: ['البشرة في أفضل حالاتها', 'مكياج خفيف يكفي', 'وقت مثالي للمناسبات'],
  },
  {
    key: 'luteal',
    emoji: '🌙',
    name: 'الأصفري',
    days: [17, 28],
    color: '#059669',
    tips: ['البشرة دهنية — استخدمي التونر', 'قناع الطين مفيد', 'احتمالية ظهور حب الشباب'],
  },
];

function getPhase(day: number, cycleLength: number = 28) {
  const adjustedDay = ((day - 1) % cycleLength) + 1;
  if (adjustedDay <= 5) return PHASES[0]!;
  if (adjustedDay <= 13) return PHASES[1]!;
  if (adjustedDay <= 16) return PHASES[2]!;
  return PHASES[3]!;
}

export const cycleTrackerRouter = router({
  settings: customerProcedure.query(async ({ ctx }) => {
    const s = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });
    return (
      s ?? {
        userId: ctx.user.id,
        cycleLength: 28,
        periodLength: 5,
        lastPeriodStart: null,
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return db.cycleSettings.upsert({
        where: { userId: ctx.user.id },
        update: {
          ...input,
          lastPeriodStart: input.lastPeriodStart ? new Date(input.lastPeriodStart) : undefined,
        },
        create: {
          userId: ctx.user.id,
          ...input,
          lastPeriodStart: input.lastPeriodStart ? new Date(input.lastPeriodStart) : undefined,
        },
      });
    }),

  today: customerProcedure.query(async ({ ctx }) => {
    const settings = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });
    const cycleLength = settings?.cycleLength ?? 28;
    const lastStart = settings?.lastPeriodStart;

    let currentDay = 14;
    let nextPeriod: string | null = null;
    let daysUntilNext: number | null = null;

    if (lastStart) {
      const diffDays = Math.floor((Date.now() - new Date(lastStart).getTime()) / 86400000);
      currentDay = (diffDays % cycleLength) + 1;
      daysUntilNext = cycleLength - (currentDay - 1);
      nextPeriod = new Date(Date.now() + daysUntilNext * 86400000).toISOString();
    }

    const phase = getPhase(currentDay, cycleLength);
    const todayEntry = await db.cycleEntry.findFirst({
      where: { userId: ctx.user.id, dayNumber: currentDay },
      orderBy: { createdAt: 'desc' },
    });

    return {
      currentDay,
      cycleLength,
      phase,
      nextPeriodDate: nextPeriod,
      daysUntilNext,
      todayEntry,
      hasSettings: !!settings?.lastPeriodStart,
    };
  }),

  logDay: customerProcedure
    .input(
      z.object({
        dayNumber: z.number().min(1).max(45),
        mood: z.string().optional(),
        flowIntensity: z.enum(['light', 'medium', 'heavy', 'spotting']).optional(),
        symptoms: z.array(z.string()).optional(),
        temperature: z.number().optional(),
        beautyNotes: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const phase = getPhase(input.dayNumber);
      const existing = await db.cycleEntry.findFirst({
        where: { userId: ctx.user.id, dayNumber: input.dayNumber },
        orderBy: { createdAt: 'desc' },
      });
      if (existing)
        return db.cycleEntry.update({
          where: { id: existing.id },
          data: { phase: phase.key, ...input },
        });
      return db.cycleEntry.create({ data: { userId: ctx.user.id, phase: phase.key, ...input } });
    }),

  myEntries: customerProcedure.query(async ({ ctx }) => {
    const entries = await db.cycleEntry.findMany({
      where: { userId: ctx.user.id },
      orderBy: { dayNumber: 'asc' },
      take: CYCLE_TRACKER_DAYS,
    });
    const settings = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });
    const cycleLength = settings?.cycleLength ?? 28;
    return { entries, cycleLength, phases: PHASES };
  }),
});
