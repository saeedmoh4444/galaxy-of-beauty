import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const PHASES = [
  { key: 'menstrual', emoji: '🩸', name: 'الدورة', color: '#ec4899' },
  { key: 'follicular', emoji: '🌸', name: 'الجريبي', color: '#f59e0b' },
  { key: 'ovulation', emoji: '✨', name: 'الإباضة', color: '#8b5cf6' },
  { key: 'luteal', emoji: '🌙', name: 'الأصفري', color: '#059669' },
];

function getPhase(day: number, cycleLength: number = 28) {
  const adj = ((day - 1) % cycleLength) + 1;
  if (adj <= 5) return PHASES[0]!;
  if (adj <= 13) return PHASES[1]!;
  if (adj <= 16) return PHASES[2]!;
  return PHASES[3]!;
}

export const wellnessHubRouter = router({
  dashboard: customerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const today = new Date(); today.setHours(0,0,0,0);

    const [cycleSettings, todayCycle, todayMood, skinAnalysis, wellness, journalCount, recentJournals] = await Promise.all([
      db.cycleSettings.findUnique({ where: { userId } }),
      (async () => {
        const s = await db.cycleSettings.findUnique({ where: { userId } });
        if (!s?.lastPeriodStart) return null;
        const diff = Math.floor((Date.now() - new Date(s.lastPeriodStart).getTime()) / 86400000);
        const day = (diff % (s.cycleLength || 28)) + 1;
        const phase = getPhase(day, s.cycleLength || 28);
        const daysUntilNext = (s.cycleLength || 28) - (day - 1);
        return { currentDay: day, cycleLength: s.cycleLength || 28, phase, daysUntilNext, nextPeriodDate: new Date(Date.now() + daysUntilNext * 86400000).toISOString() };
      })(),
      db.selfCareCheckin.findFirst({ where: { userId, createdAt: { gte: today } }, orderBy: { createdAt: 'desc' } }),
      db.skinAnalysis.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { skinType: true, concerns: true, createdAt: true } }),
      db.wellnessCheckin.findFirst({ where: { userId, date: today.toISOString().slice(0,10) } }),
      db.beautyJournal.count({ where: { userId } }),
      db.beautyJournal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, title: true, content: true, mood: true, createdAt: true } }),
    ]);

    // Weekly wellness summary
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const weeklyCheckins = await db.selfCareCheckin.findMany({ where: { userId, createdAt: { gte: weekAgo } }, orderBy: { createdAt: 'asc' } });

    const avgMood = weeklyCheckins.length > 0 ? Math.round(weeklyCheckins.reduce((s: number, c: any) => s + (c.mood || 0), 0) / weeklyCheckins.length) : null;
    const avgEnergy = weeklyCheckins.length > 0 ? Math.round(weeklyCheckins.reduce((s: number, c: any) => s + (c.energy || 0), 0) / weeklyCheckins.length) : null;

    return {
      cycle: todayCycle,
      settings: cycleSettings ? { hasPeriodStart: !!cycleSettings.lastPeriodStart } : null,
      todayMood: todayMood ? { mood: todayMood.mood, energy: todayMood.energy, sleepHours: todayMood.sleepHours, waterGlasses: todayMood.waterGlasses } : null,
      skin: skinAnalysis ? { skinType: skinAnalysis.skinType, concerns: skinAnalysis.concerns, lastAnalysis: skinAnalysis.createdAt } : null,
      wellness: wellness ? { water: wellness.water, sleep: wellness.sleep, mood: wellness.mood, steps: wellness.steps, skincare: wellness.skincare } : null,
      weekly: { avgMood, avgEnergy, checkinCount: weeklyCheckins.length },
      journalCount,
      recentJournals: (recentJournals as any[]).map((j: any) => ({ id: j.id, title: j.title, content: j.content?.slice(0, 100), mood: j.mood, date: j.createdAt })),
    };
  }),
});
