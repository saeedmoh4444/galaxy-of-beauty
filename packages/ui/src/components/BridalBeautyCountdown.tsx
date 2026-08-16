'use client';

import { cn } from '@galaxy/shared';

/**
 * Bridal Beauty Countdown — countdown to wedding day with beauty milestones.
 * From Phase W2: Life Stage Beauty — Bridal Journey.
 *
 * Usage:
 *   <BridalBeautyCountdown weddingDate="2027-06-15" />
 */

interface Milestone {
  label: string;
  emoji: string;
  daysBefore: number;
  done: boolean;
}

interface BridalBeautyCountdownProps {
  weddingDate: string;
  completedMilestones?: string[];
  className?: string;
}

const MILESTONES: Omit<Milestone, 'done'>[] = [
  { label: 'خطة العناية', emoji: '', daysBefore: 180 },
  { label: 'روتين يومي', emoji: '', daysBefore: 150 },
  { label: 'علاجات متقدمة', emoji: '‍️', daysBefore: 120 },
  { label: 'تجربة الإطلالة', emoji: '', daysBefore: 90 },
  { label: 'اللمسات النهائية', emoji: '', daysBefore: 60 },
  { label: 'الاستعداد الأخير', emoji: '', daysBefore: 30 },
  { label: 'يوم الزفاف', emoji: '', daysBefore: 0 },
];

export function BridalBeautyCountdown({
  weddingDate,
  completedMilestones = [],
  className = '',
}: BridalBeautyCountdownProps): JSX.Element {
  const today = new Date();
  const wedding = new Date(weddingDate);
  const daysLeft = Math.max(
    0,
    Math.ceil((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const isPast = daysLeft === 0;

  const milestones: Milestone[] = MILESTONES.map((m) => ({
    ...m,
    done: completedMilestones.includes(m.label) || daysLeft <= m.daysBefore,
  }));

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-5 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          {isPast ? '' : ''}
        </span>
        <h4 className="mt-1 text-sm font-bold text-rose-700 dark:text-rose-300">
          {isPast ? 'يوم الزفاف!' : 'العد التنازلي للزفاف'}
        </h4>
        <p className="text-[10px] text-rose-500 dark:text-rose-400">
          {isPast ? 'مبروك! ' : `${daysLeft} يوم متبقي`}
        </p>
      </div>

      {!isPast && (
        <div className="mt-3 space-y-1.5">
          {milestones.map((m, _i) => (
            <div
              key={m.label}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2',
                m.done ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-gray-50 dark:bg-gray-800',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs',
                  m.done
                    ? 'bg-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700',
                )}
              >
                {m.done ? '' : m.emoji}
              </span>
              <span
                className={cn(
                  'flex-1 text-[10px]',
                  m.done
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-text-secondary dark:text-gray-300',
                )}
              >
                {m.label}
              </span>
              <span className="text-[9px] text-text-tertiary dark:text-gray-500">
                {m.daysBefore} يوم
              </span>
            </div>
          ))}
        </div>
      )}

      {isPast && (
        <div className="mt-3 rounded-xl bg-rose-50 p-4 text-center dark:bg-rose-950">
          <p className="text-lg" aria-hidden="true"></p>
          <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
            ألف مبروك! رحلة الجمال اكتملت
          </p>
        </div>
      )}
    </div>
  );
}
