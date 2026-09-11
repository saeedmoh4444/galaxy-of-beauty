/**
 * E4a — cycle math + content, shared by the cycleTracker and wellnessHub
 * routers (the PHASES table + getPhase used to be duplicated in both).
 * Pure functions — no JSX, no server imports.
 */

export interface CyclePhase {
  key: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  emoji: string;
  name: string;
  days: [number, number];
  color: string;
  tips: string[];
}

export const CYCLE_PHASES: CyclePhase[] = [
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
    emoji: '🌱',
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

/** Day-of-cycle → phase (day 1-based, wraps by cycle length). */
export function getCyclePhase(day: number, cycleLength: number = 28): CyclePhase {
  const adjustedDay = ((day - 1) % cycleLength) + 1;
  if (adjustedDay <= 5) return CYCLE_PHASES[0]!;
  if (adjustedDay <= 13) return CYCLE_PHASES[1]!;
  if (adjustedDay <= 16) return CYCLE_PHASES[2]!;
  return CYCLE_PHASES[3]!;
}

/** E4a — symptom slugs for logDay (validated + labelled). Slugs match the
 *  existing `cycleTracker.symptom.*` i18n keys so the UI chips validate. */
export const CYCLE_SYMPTOMS: Array<{ slug: string; ar: string; en: string }> = [
  { slug: 'cramps', ar: 'تقلصات', en: 'Cramps' },
  { slug: 'headache', ar: 'صداع', en: 'Headache' },
  { slug: 'fatigue', ar: 'إرهاق', en: 'Fatigue' },
  { slug: 'bloating', ar: 'انتفاخ', en: 'Bloating' },
  { slug: 'nausea', ar: 'غثيان', en: 'Nausea' },
  { slug: 'insomnia', ar: 'أرق', en: 'Insomnia' },
  { slug: 'increasedAppetite', ar: 'زيادة الشهية', en: 'Increased appetite' },
  { slug: 'backPain', ar: 'ألم الظهر', en: 'Back pain' },
  { slug: 'breastTenderness', ar: 'حساسية الثدي', en: 'Breast tenderness' },
  { slug: 'moodSwings', ar: 'تقلبات المزاج', en: 'Mood swings' },
];

/** E4a — PMS self-care tips (luteal phase). */
export const PMS_LIBRARY: Array<{ ar: string; en: string; emoji: string }> = [
  {
    ar: 'خففي الملح والكافيين — يقلل الانتفاخ والصداع',
    en: 'Cut salt and caffeine — reduces bloating and headaches',
    emoji: '',
  },
  {
    ar: 'المشي الخفيف ٢٠ دقيقة يحسن المزاج',
    en: 'A light 20-minute walk lifts your mood',
    emoji: '',
  },
  {
    ar: 'اشربي ماءً دافئاً مع الأعشاب المهدئة',
    en: 'Sip warm water with calming herbal tea',
    emoji: '',
  },
  {
    ar: 'قناع الطين مرة هذا الأسبوع يقلل البثور الهرمونية',
    en: 'One clay mask this week reduces hormonal breakouts',
    emoji: '',
  },
];

const DAY_MS = 86_400_000;

export interface CyclePredictions {
  currentDay: number;
  cycleLength: number;
  phase: CyclePhase;
  nextPeriodDate: string | null;
  daysUntilNext: number | null;
  ovulationDate: string | null;
  fertileStart: string | null;
  fertileEnd: string | null;
  isFertileToday: boolean;
  predictionSource: 'average' | 'default';
  hasSettings: boolean;
}

/**
 * E4a — history-aware cycle predictions. When avgCycleLength is known it
 * replaces the fixed cycle length (predictionSource 'average').
 * Ovulation = nextPeriodStart − 14 (standard rule); fertile window =
 * ovulation − 5 .. ovulation + 1.
 */
export function computeCyclePredictions(input: {
  cycleLength: number;
  lastPeriodStart: Date | null;
  avgCycleLength?: number | null;
  now?: Date;
}): CyclePredictions {
  const { cycleLength: configuredLength, lastPeriodStart, avgCycleLength } = input;
  const now = input.now ?? new Date();

  const base: CyclePredictions = {
    currentDay: 14,
    cycleLength: avgCycleLength ?? configuredLength,
    phase: getCyclePhase(14, configuredLength),
    nextPeriodDate: null,
    daysUntilNext: null,
    ovulationDate: null,
    fertileStart: null,
    fertileEnd: null,
    isFertileToday: false,
    predictionSource: avgCycleLength ? 'average' : 'default',
    hasSettings: !!lastPeriodStart,
  };

  if (!lastPeriodStart) return base;

  const cycleLength = avgCycleLength ?? configuredLength;
  const diffDays = Math.floor((now.getTime() - lastPeriodStart.getTime()) / DAY_MS);
  const currentDay = (diffDays % cycleLength) + 1;
  const daysUntilNext = cycleLength - (currentDay - 1);
  const nextPeriod = new Date(now.getTime() + daysUntilNext * DAY_MS);
  const ovulation = new Date(nextPeriod.getTime() - 14 * DAY_MS);
  const fertileStart = new Date(ovulation.getTime() - 5 * DAY_MS);
  const fertileEnd = new Date(ovulation.getTime() + 1 * DAY_MS);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const isFertileToday =
    todayStart >=
      new Date(
        fertileStart.getFullYear(),
        fertileStart.getMonth(),
        fertileStart.getDate(),
      ).getTime() &&
    todayStart <=
      new Date(fertileEnd.getFullYear(), fertileEnd.getMonth(), fertileEnd.getDate()).getTime();

  return {
    ...base,
    currentDay,
    cycleLength,
    phase: getCyclePhase(currentDay, cycleLength),
    nextPeriodDate: nextPeriod.toISOString(),
    daysUntilNext,
    ovulationDate: ovulation.toISOString(),
    fertileStart: fertileStart.toISOString(),
    fertileEnd: fertileEnd.toISOString(),
    isFertileToday,
  };
}

/** E4a — pregnancy timeline (pregnancyMode). Weeks from the 40-week due date. */
export function computePregnancy(input: { dueDate: Date; now?: Date }) {
  const now = input.now ?? new Date();
  const due = new Date(input.dueDate);
  const weeksUntilDue = Math.max(0, Math.round((due.getTime() - now.getTime()) / (7 * DAY_MS)));
  const weeksPregnant = Math.min(40, Math.max(1, 40 - weeksUntilDue));
  const trimester = weeksPregnant <= 13 ? 1 : weeksPregnant <= 27 ? 2 : 3;
  return { weeksPregnant, trimester };
}
