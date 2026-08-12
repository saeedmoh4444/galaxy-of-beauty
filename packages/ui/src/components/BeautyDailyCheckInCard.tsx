'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Daily Check-In Card — daily beauty ritual tracker.
 * From Phase W3: Health & Wellness.
 *
 * Usage:
 *   <BeautyDailyCheckInCard />
 */

const RITUALS = [
  { emoji: '', label: '8 أكواب ماء' },
  { emoji: '', label: 'روتين عناية' },
  { emoji: '️', label: 'واقي شمس' },
  { emoji: '', label: 'نوم كافٍ' },
  { emoji: '', label: 'تأمل' },
  { emoji: '', label: 'تغذية صحية' },
];

interface BeautyDailyCheckInCardProps {
  className?: string;
}

export function BeautyDailyCheckInCard({
  className = '',
}: BeautyDailyCheckInCardProps): JSX.Element {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  const pct = Math.round((checked.size / RITUALS.length) * 100);

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl"></span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              تسجيل اليوم
            </h4>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
              {checked.size}/{RITUALS.length} · {pct}%
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {RITUALS.map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition-all',
              checked.has(i)
                ? 'bg-emerald-50 ring-1 ring-emerald-300 dark:bg-emerald-950 dark:ring-emerald-700'
                : 'bg-gray-50 dark:bg-gray-800',
            )}
          >
            <span className="text-lg">{r.emoji}</span>
            <span
              className={cn(
                'text-[9px] font-medium',
                checked.has(i)
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-400 dark:text-gray-600',
              )}
            >
              {r.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
