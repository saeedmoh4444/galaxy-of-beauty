'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Savings Milestone Card — celebrate savings milestones.
 * From Phase W5: Financial Empowerment — Beauty Savings Account.
 *
 * Usage:
 *   <BeautySavingsMilestoneCard saved={1500} milestones={[500, 1000, 2000, 5000]} />
 */

interface BeautySavingsMilestoneCardProps {
  saved: number;
  milestones: number[];
  onViewSavings?: () => void;
  className?: string;
}

const COLORS = [
  'from-amber-400 to-yellow-400',
  'from-amber-500 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-purple-400 to-violet-500',
  'from-emerald-400 to-green-500',
];

export function BeautySavingsMilestoneCard({
  saved,
  milestones,
  onViewSavings,
  className = '',
}: BeautySavingsMilestoneCardProps): JSX.Element | null {
  if (!milestones.length) return null;
  const nextMilestone = milestones.find((m) => m > saved);

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-5 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          🏆
        </span>
        <h4 className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
          محطات الادخار
        </h4>
        <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
          {saved.toLocaleString('ar-SA')} ر.س مدخرة
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {milestones.map((m, i) => (
          <div key={m} className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                saved >= m
                  ? `bg-gradient-to-br ${COLORS[i % COLORS.length]}`
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400',
              )}
            >
              {saved >= m ? '✅' : m / 1000 + 'k'}
            </div>
            <div
              className={cn(
                'flex-1 h-2 rounded-full',
                saved >= m
                  ? `bg-gradient-to-r ${COLORS[i % COLORS.length]}`
                  : 'bg-gray-100 dark:bg-gray-700',
              )}
            >
              <div
                className={cn('h-full rounded-full', saved >= m ? 'opacity-100' : 'opacity-0')}
                style={{ width: '100%' }}
              />
            </div>
            <span
              className={cn(
                'text-[10px] font-bold w-16 text-right',
                saved >= m
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-400 dark:text-gray-600',
              )}
            >
              {m.toLocaleString('ar-SA')} ر.س
            </span>
          </div>
        ))}
      </div>

      {nextMilestone && (
        <div className="mt-2 rounded-lg bg-amber-50 p-2 text-center dark:bg-amber-950">
          <p className="text-[10px] text-amber-700 dark:text-amber-300">
            🎯 المحطة القادمة: {nextMilestone.toLocaleString('ar-SA')} ر.س — باقي{' '}
            {nextMilestone - saved} ر.س
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onViewSavings}
        className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        تفقدي مدخراتكِ 💰
      </button>
    </div>
  );
}
