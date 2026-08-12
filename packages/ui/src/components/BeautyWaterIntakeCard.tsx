'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Water Intake Card — track daily water consumption for skin health.
 * From Phase W3: Health & Wellness.
 *
 * Usage:
 *   <BeautyWaterIntakeCard goal={8} />
 */

interface BeautyWaterIntakeCardProps {
  goal?: number;
  className?: string;
}

export function BeautyWaterIntakeCard({
  goal = 8,
  className = '',
}: BeautyWaterIntakeCardProps): JSX.Element {
  const [cups, setCups] = useState(3);
  const add = () => cups < goal && setCups((c) => c + 1);
  const pct = Math.min(100, Math.round((cups / goal) * 100));

  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl"></span>
          <div>
            <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">الماء</h4>
            <p className="text-[10px] text-sky-500 dark:text-sky-400">
              {cups}/{goal} أكواب
            </p>
          </div>
        </div>
        <span className="text-lg font-bold text-sky-700 dark:text-sky-300">{pct}%</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {Array.from({ length: goal }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => (i < cups ? null : setCups(i + 1))}
            className={cn(
              'h-7 w-7 rounded-lg text-xs transition-all',
              i < cups
                ? 'bg-sky-200 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
                : 'bg-gray-100 text-gray-400 hover:bg-sky-50 dark:bg-gray-800',
            )}
          >
            
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={cups >= goal}
        className="mt-3 w-full rounded-xl bg-sky-600 py-2 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-50 transition-all"
      >
        + كوب
      </button>
    </div>
  );
}
