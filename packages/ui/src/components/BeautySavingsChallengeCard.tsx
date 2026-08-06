'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Savings Challenge Card — gamified savings challenge for beauty goals.
 * From Phase W5: Financial Empowerment.
 *
 * Usage:
 *   <BeautySavingsChallengeCard challenge={{ name: 'تحدي الـ 30 يوم', target: 300, saved: 180, days: 30 }} />
 */

interface SavingsChallenge {
  name: string;
  target: number;
  saved: number;
  days: number;
  emoji?: string;
}

interface BeautySavingsChallengeCardProps {
  challenge: SavingsChallenge;
  onAddSavings?: () => void;
  className?: string;
}

export function BeautySavingsChallengeCard({ challenge, onAddSavings, className = '' }: BeautySavingsChallengeCardProps): JSX.Element {
  const pct = Math.min(100, Math.round((challenge.saved / challenge.target) * 100));
  const dailyTarget = Math.round(challenge.target / challenge.days);
  const remaining = challenge.target - challenge.saved;

  return (
    <div className={cn('rounded-2xl border border-emerald-100 bg-white p-5 dark:border-emerald-900 dark:bg-gray-900', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">{challenge.emoji || '🐷'}</span>
        <h4 className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">{challenge.name}</h4>
        <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{dailyTarget} ر.س يومياً · {challenge.days} يوم</p>
      </div>

      <div className="mt-3 rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-emerald-600 dark:text-emerald-400">تم الادخار</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300">{challenge.saved} / {challenge.target} ر.س</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{pct}%</p>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {Array.from({ length: Math.min(challenge.days, 7) }).map((_, i) => {
          const dayPct = challenge.target / challenge.days;
          const daySaved = i < Math.floor(challenge.saved / dayPct);
          return (
            <div key={i} className={cn('h-6 rounded text-[8px] flex items-center justify-center font-bold', daySaved ? 'bg-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800')}>
              {i + 1}
            </div>
          );
        })}
      </div>

      {remaining > 0 && (
        <button type="button" onClick={onAddSavings} className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all">
          أضيفي {Math.min(dailyTarget, remaining)} ر.س 💰
        </button>
      )}
      {remaining <= 0 && (
        <div className="mt-3 rounded-lg bg-emerald-100 p-2 text-center dark:bg-emerald-900">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">🎉 أكملتِ التحدي!</p>
        </div>
      )}
    </div>
  );
}
