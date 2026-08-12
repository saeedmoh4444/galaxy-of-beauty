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
  title: string;
  days: string;
  description: string;
  recommended: string[];
  avoid: string[];
  colorClass: string;
  gradientClass: string;
}

const PHASES: Record<CyclePhase, PhaseData> = {
  menstrual: {
    emoji: '🩸',
    title: 'الدورة الشهرية',
    days: 'الأيام 1-5',
    description: 'وقت الراحة والاسترخاء. جسمكِ يحتاج إلى عناية لطيفة.',
    recommended: ['مساج خفيف', 'حمام دافئ', 'كمادات ساخنة', 'شاي أعشاب'],
    avoid: ['إزالة الشعر', 'تقشير عميق', 'جلسات طويلة'],
    colorClass: 'border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/30',
    gradientClass: 'from-rose-200 to-rose-300 dark:from-rose-800 dark:to-rose-700',
  },
  follicular: {
    emoji: '',
    title: 'المرحلة الجرابية',
    days: 'الأيام 6-14',
    description: 'طاقتكِ في ذروتها! أفضل وقت للعناية المكثفة والتجديد.',
    recommended: ['تنظيف عميق للبشرة', 'تقشير', 'إزالة الشعر', 'علاجات مغذية'],
    avoid: ['لا شيء — استمتعي!'],
    colorClass: 'border-pink-200 bg-pink-50/50 dark:border-pink-900 dark:bg-pink-950/30',
    gradientClass: 'from-pink-300 to-rose-300 dark:from-pink-800 dark:to-rose-700',
  },
  ovulation: {
    emoji: '',
    title: 'الإباضة',
    days: 'اليوم 14 تقريباً',
    description: 'بشرتكِ في أجمل حالاتها! الوقت المثالي للمناسبات والصور.',
    recommended: ['مكياج للمناسبات', 'تصوير', 'تسريحة شعر', 'عناية بالأظافر'],
    avoid: ['علاجات قوية غير ضرورية'],
    colorClass: 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30',
    gradientClass: 'from-amber-300 to-yellow-300 dark:from-amber-800 dark:to-yellow-700',
  },
  luteal: {
    emoji: '',
    title: 'المرحلة الأصفرية',
    days: 'الأيام 15-28',
    description: 'بشرتكِ قد تكون حساسة. اختاري علاجات مهدئة ولطيفة.',
    recommended: ['ماسك مرطب', 'مساج استرخاء', 'تأمل', 'عناية بالقدمين'],
    avoid: ['إزالة الشعر (البشرة حساسة)', 'تقشير قوي', 'منتجات جديدة'],
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
}

export function CyclePhaseCard({
  phase,
  day,
  onPhaseChange,
  className = '',
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
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">{data.title}</h4>
            <p className="text-[10px] text-text-tertiary dark:text-gray-400">
              {data.days}
              {day && ` — اليوم ${day}`}
            </p>
          </div>
        </div>

        {/* Cycle day indicator */}
        {day && (
          <div className="text-right">
            <span className="text-[10px] text-text-tertiary dark:text-gray-400">يوم</span>
            <div className="text-lg font-bold text-text-primary dark:text-gray-100">{day}</div>
            <span className="text-[10px] text-text-tertiary dark:text-gray-400">/ 28</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mt-2 text-xs leading-relaxed text-text-secondary dark:text-gray-300">
        {data.description}
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
              {PHASES[p].title}
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
          <h5 className="text-[10px] font-bold text-success dark:text-green-400"> ينصح بها</h5>
          <ul className="mt-1 space-y-0.5">
            {data.recommended.map((r) => (
              <li key={r} className="text-[10px] text-text-secondary dark:text-gray-300">
                • {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Avoid */}
        <div className="rounded-xl bg-white/70 p-2.5 dark:bg-gray-800/70">
          <h5 className="text-[10px] font-bold text-danger dark:text-red-400"> تجنبي</h5>
          <ul className="mt-1 space-y-0.5">
            {data.avoid.map((a) => (
              <li key={a} className="text-[10px] text-text-secondary dark:text-gray-300">
                • {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer tip */}
      <p className="mt-2 text-center text-[9px] italic text-text-tertiary dark:text-gray-500">
         CycleSync™ — لأن جمالكِ مرتبط بصحتكِ
      </p>
    </div>
  );
}
