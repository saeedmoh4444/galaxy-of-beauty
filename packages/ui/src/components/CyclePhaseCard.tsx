'use client';

import { cn } from '@galaxy/shared';

/**
 * CyclePhaseCard — beauty recommendations based on menstrual cycle phase.
 * From Phase W3: Health & Wellness Integration — CycleSync™.
 *
 * Usage:
 *   <CyclePhaseCard phase="follicular" day={8} />
 */

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

interface PhaseData {
  emoji: string;
  title: { ar: string; en: string };
  days: { ar: string; en: string };
  description: { ar: string; en: string };
  recommended: { ar: string; en: string }[];
  avoid: { ar: string; en: string }[];
  colorClass: string;
  gradientClass: string;
}

const PHASES: Record<CyclePhase, PhaseData> = {
  menstrual: {
    emoji: '🩸',
    title: { ar: 'الدورة الشهرية', en: 'Menstrual phase' },
    days: { ar: 'الأيام 1-5', en: 'Days 1-5' },
    description: {
      ar: 'وقت الراحة والاسترخاء. جسمكِ يحتاج إلى عناية لطيفة.',
      en: 'A time for rest and relaxation. Your body needs gentle care.',
    },
    recommended: [
      { ar: 'مساج خفيف', en: 'Light massage' },
      { ar: 'حمام دافئ', en: 'Warm bath' },
      { ar: 'كمادات ساخنة', en: 'Warm compresses' },
      { ar: 'شاي أعشاب', en: 'Herbal tea' },
    ],
    avoid: [
      { ar: 'إزالة الشعر', en: 'Hair removal' },
      { ar: 'تقشير عميق', en: 'Deep exfoliation' },
      { ar: 'جلسات طويلة', en: 'Long sessions' },
    ],
    colorClass: 'border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/30',
    gradientClass: 'from-rose-200 to-rose-300 dark:from-rose-800 dark:to-rose-700',
  },
  follicular: {
    emoji: '',
    title: { ar: 'المرحلة الجرابية', en: 'Follicular phase' },
    days: { ar: 'الأيام 6-14', en: 'Days 6-14' },
    description: {
      ar: 'طاقتكِ في ذروتها! أفضل وقت للعناية المكثفة والتجديد.',
      en: 'Your energy is at its peak! The best time for intensive care and renewal.',
    },
    recommended: [
      { ar: 'تنظيف عميق للبشرة', en: 'Deep facial cleansing' },
      { ar: 'تقشير', en: 'Exfoliation' },
      { ar: 'إزالة الشعر', en: 'Hair removal' },
      { ar: 'علاجات مغذية', en: 'Nourishing treatments' },
    ],
    avoid: [{ ar: 'لا شيء — استمتعي!', en: 'Nothing — enjoy!' }],
    colorClass: 'border-pink-200 bg-pink-50/50 dark:border-pink-900 dark:bg-pink-950/30',
    gradientClass: 'from-pink-300 to-rose-300 dark:from-pink-800 dark:to-rose-700',
  },
  ovulation: {
    emoji: '',
    title: { ar: 'الإباضة', en: 'Ovulation' },
    days: { ar: 'اليوم 14 تقريباً', en: 'Around day 14' },
    description: {
      ar: 'بشرتكِ في أجمل حالاتها! الوقت المثالي للمناسبات والصور.',
      en: 'Your skin is at its best! The perfect time for occasions and photos.',
    },
    recommended: [
      { ar: 'مكياج للمناسبات', en: 'Occasion makeup' },
      { ar: 'تصوير', en: 'Photo shoots' },
      { ar: 'تسريحة شعر', en: 'Hair styling' },
      { ar: 'عناية بالأظافر', en: 'Nail care' },
    ],
    avoid: [{ ar: 'علاجات قوية غير ضرورية', en: 'Unnecessary strong treatments' }],
    colorClass: 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30',
    gradientClass: 'from-amber-300 to-yellow-300 dark:from-amber-800 dark:to-yellow-700',
  },
  luteal: {
    emoji: '',
    title: { ar: 'المرحلة الأصفرية', en: 'Luteal phase' },
    days: { ar: 'الأيام 15-28', en: 'Days 15-28' },
    description: {
      ar: 'بشرتكِ قد تكون حساسة. اختاري علاجات مهدئة ولطيفة.',
      en: 'Your skin may be sensitive. Choose soothing, gentle treatments.',
    },
    recommended: [
      { ar: 'ماسك مرطب', en: 'Hydrating mask' },
      { ar: 'مساج استرخاء', en: 'Relaxing massage' },
      { ar: 'تأمل', en: 'Meditation' },
      { ar: 'عناية بالقدمين', en: 'Foot care' },
    ],
    avoid: [
      { ar: 'إزالة الشعر (البشرة حساسة)', en: 'Hair removal (skin is sensitive)' },
      { ar: 'تقشير قوي', en: 'Strong exfoliation' },
      { ar: 'منتجات جديدة', en: 'New products' },
    ],
    colorClass: 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30',
    gradientClass: 'from-indigo-300 to-purple-300 dark:from-indigo-800 dark:to-purple-700',
  },
};

interface CyclePhaseCardProps {
  phase: CyclePhase;
  /** Current day of cycle (1-28) */
  day?: number;
  /** Enable phase switching */
  onPhaseChange?: (phase: CyclePhase) => void;
  className?: string;
  /** Label prefixing the day indicator */
  dayLabel?: string;
  /** Word prefixing the current day in the header */
  todayLabel?: string;
  /** Label for the recommended section */
  recommendedLabel?: string;
  /** Label for the avoid section */
  avoidLabel?: string;
  /** Footer tip text */
  footerTip?: string;
  /** Locale for internal phase data strings */
  locale?: 'ar' | 'en';
}

export function CyclePhaseCard({
  phase,
  day,
  onPhaseChange,
  className = '',
  dayLabel = 'يوم',
  todayLabel = 'اليوم',
  recommendedLabel = ' ينصح بها',
  avoidLabel = ' تجنبي',
  footerTip = 'CycleSync™ — لأن جمالكِ مرتبط بصحتكِ',
  locale = 'ar',
}: CyclePhaseCardProps): JSX.Element {
  const data = PHASES[phase];
  const phases: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

  return (
    <div className={cn('rounded-2xl border p-5', data.colorClass, className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            {data.emoji}
          </span>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
              {data.title[locale]}
            </h4>
            <p className="text-[10px] text-text-tertiary dark:text-gray-400">
              {data.days[locale]}
              {day && ` — ${todayLabel} ${day}`}
            </p>
          </div>
        </div>

        {/* Cycle day indicator */}
        {day && (
          <div className="text-right">
            <span className="text-[10px] text-text-tertiary dark:text-gray-400">{dayLabel}</span>
            <div className="text-lg font-bold text-text-primary dark:text-gray-100">{day}</div>
            <span className="text-[10px] text-text-tertiary dark:text-gray-400">/ 28</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mt-2 text-xs leading-relaxed text-text-secondary dark:text-gray-300">
        {data.description[locale]}
      </p>

      {/* Cycle progress bar */}
      <div className="mt-3">
        <div className="flex justify-between gap-0.5">
          {phases.map((p) => (
            <div
              key={p}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all',
                p === phase ? 'bg-current opacity-80' : 'bg-gray-200 dark:bg-gray-700',
              )}
              style={{
                backgroundColor: p === phase ? undefined : undefined,
                color:
                  p === phase
                    ? phase === 'menstrual'
                      ? '#e11d48'
                      : phase === 'follicular'
                        ? '#ec4899'
                        : phase === 'ovulation'
                          ? '#f59e0b'
                          : '#6366f1'
                    : undefined,
              }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-text-tertiary dark:text-gray-500">
          {phases.map((p) => (
            <span key={p} className={cn(p === phase && 'font-bold text-current')}>
              {PHASES[p].title[locale]}
            </span>
          ))}
        </div>
      </div>

      {/* Phase switcher — compact pills */}
      {onPhaseChange && (
        <div className="mt-3 flex gap-1">
          {phases.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPhaseChange(p)}
              className={cn(
                'flex-1 rounded-full px-2 py-1 text-[10px] font-medium transition-all',
                p === phase
                  ? 'bg-white text-text-primary shadow-sm dark:bg-gray-800 dark:text-gray-100'
                  : 'text-text-tertiary hover:bg-white/50 dark:hover:bg-gray-800/50',
              )}
            >
              {PHASES[p].emoji}
            </button>
          ))}
        </div>
      )}

      {/* Recommendations & Avoid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {/* Recommended */}
        <div className="rounded-xl bg-white/70 p-2.5 dark:bg-gray-800/70">
          <h5 className="text-[10px] font-bold text-success dark:text-green-400">
            {recommendedLabel}
          </h5>
          <ul className="mt-1 space-y-0.5">
            {data.recommended.map((r) => (
              <li key={r.ar} className="text-[10px] text-text-secondary dark:text-gray-300">
                • {r[locale]}
              </li>
            ))}
          </ul>
        </div>

        {/* Avoid */}
        <div className="rounded-xl bg-white/70 p-2.5 dark:bg-gray-800/70">
          <h5 className="text-[10px] font-bold text-danger dark:text-red-400">{avoidLabel}</h5>
          <ul className="mt-1 space-y-0.5">
            {data.avoid.map((a) => (
              <li key={a.ar} className="text-[10px] text-text-secondary dark:text-gray-300">
                • {a[locale]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer tip */}
      <p className="mt-2 text-center text-[9px] italic text-text-tertiary dark:text-gray-500">
        {footerTip}
      </p>
    </div>
  );
}
