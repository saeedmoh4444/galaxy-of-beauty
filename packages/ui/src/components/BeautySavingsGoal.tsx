'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Savings Goal — visual savings tracker for beauty treatments.
 * From Phase W5: Financial Empowerment.
 *
 * Usage:
 *   <BeautySavingsGoal
 *     goals={[{ label: 'باقة العناية بالبشرة', target: 500, saved: 325, monthly: 100 }]}
 *   />
 */

interface SavingsGoal {
  /** Goal label (e.g. package name) */
  label: string;
  /** Target amount in SAR */
  target: number;
  /** Amount already saved in SAR */
  saved: number;
  /** Optional monthly auto-save amount in SAR */
  monthly?: number;
  /** Optional emoji */
  emoji?: string;
}

interface BeautySavingsGoalProps {
  goals: SavingsGoal[];
  className?: string;
}

function formatSAR(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BeautySavingsGoal({
  goals,
  className = '',
}: BeautySavingsGoalProps): JSX.Element | null {
  const [contribute, setContribute] = useState<Record<number, string>>({});

  if (!goals.length) return null;

  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-5 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
             حصالتي التجميلية
          </h4>
          <p className="mt-0.5 text-xs text-text-tertiary dark:text-gray-400">
            ادخري لهواياتكِ الجمالية
          </p>
        </div>
        <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          {formatSAR(totalSaved)} / {formatSAR(totalTarget)}
        </div>
      </div>

      {/* Overall progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-tertiary dark:text-gray-400">التقدم الكلي</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {Math.round((totalSaved / totalTarget) * 100)}%
          </span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-950">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.round((totalSaved / totalTarget) * 100))}%` }}
          />
        </div>
      </div>

      {/* Individual goals */}
      <div className="mt-4 space-y-3">
        {goals.map((goal, i) => {
          const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
          const remaining = goal.target - goal.saved;
          const currentContribute = contribute[i] ?? '';

          return (
            <div
              key={i}
              className="rounded-xl border border-gray-100 bg-surface p-3 dark:border-gray-800 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary dark:text-gray-100">
                  {goal.emoji ? `${goal.emoji} ` : ''}
                  {goal.label}
                </span>
                <span
                  className={cn(
                    'text-xs font-bold',
                    remaining <= 0
                      ? 'text-success dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400',
                  )}
                >
                  {remaining <= 0 ? ' اكتمل!' : `باقي ${formatSAR(remaining)}`}
                </span>
              </div>

              {/* Per-goal progress */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      remaining <= 0
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-text-secondary dark:text-gray-300">
                  {pct}%
                </span>
              </div>

              {/* SAR labels */}
              <div className="mt-1 flex justify-between text-[10px] text-text-tertiary dark:text-gray-500">
                <span>{formatSAR(goal.saved)} تم</span>
                <span>{formatSAR(goal.target)} الهدف</span>
              </div>

              {/* Monthly contribution row */}
              {goal.monthly && remaining > 0 && (
                <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2 dark:border-gray-700">
                  <span className="text-[10px] text-text-tertiary dark:text-gray-500">
                     شهرياً {formatSAR(goal.monthly)}
                  </span>
                  <div className="h-1 flex-1 rounded-full bg-amber-50 dark:bg-amber-950">
                    <div
                      className="h-full rounded-full bg-amber-300 dark:bg-amber-700 transition-all"
                      style={{ width: `${Math.min(100, (goal.saved / goal.monthly) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-tertiary dark:text-gray-500">
                    {Math.ceil(remaining / goal.monthly)} شهور متبقية
                  </span>
                </div>
              )}

              {/* Quick-contribute input */}
              {remaining > 0 && (
                <div className="mt-2 flex gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={remaining}
                    value={currentContribute}
                    onChange={(e) => setContribute((prev) => ({ ...prev, [i]: e.target.value }))}
                    placeholder="أضف مبلغ..."
                    className="flex-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 dark:placeholder:text-amber-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setContribute((prev) => ({ ...prev, [i]: '' }));
                    }}
                    disabled={!currentContribute || Number(currentContribute) <= 0}
                    className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-40"
                  >
                    إضافة
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer encouragement */}
      {totalSaved < totalTarget && (
        <p className="mt-3 text-center text-[10px] text-text-tertiary dark:text-gray-500">
           كل ريال يقرّبكِ من جمالكِ — استمري!
        </p>
      )}
      {totalSaved >= totalTarget && (
        <p className="mt-3 text-center text-[10px] font-bold text-success dark:text-green-400">
           مبروك! حققتِ هدفكِ — استمتعي بجمالكِ!
        </p>
      )}
    </div>
  );
}
