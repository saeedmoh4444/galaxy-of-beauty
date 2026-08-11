'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Hydration Tracker — daily water intake for skin health.
 * From Phase W3: Health & Wellness Integration.
 *
 * Usage:
 *   <HydrationTracker goal={8} current={5} />
 */

interface HydrationTrackerProps {
  goal?: number;
  current?: number;
  onAddCup?: () => void;
  className?: string;
}

export function HydrationTracker({
  goal = 8,
  current: initialCurrent = 0,
  onAddCup,
  className = '',
}: HydrationTrackerProps): JSX.Element {
  const [current, setCurrent] = useState(initialCurrent);
  const pct = Math.min(100, Math.round((current / goal) * 100));

  const addCup = () => {
    if (current >= goal) return;
    setCurrent((c) => c + 1);
    onAddCup?.();
  };

  const reset = () => setCurrent(0);

  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            💧
          </span>
          <div>
            <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">متعقب الماء</h4>
            <p className="text-[10px] text-sky-500 dark:text-sky-400">
              {current}/{goal} أكواب
            </p>
          </div>
        </div>
      </div>

      {/* Water cups visual */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.from({ length: goal }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (i < current) return;
              setCurrent(i + 1);
              onAddCup?.();
            }}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all',
              i < current
                ? 'bg-sky-200 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
                : 'bg-gray-100 text-gray-400 hover:bg-sky-50 dark:bg-gray-800 dark:hover:bg-gray-700',
            )}
          >
            💧
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-text-tertiary dark:text-gray-500">
            {pct >= 100 ? '🎉 أكملتِ الهدف!' : `باقي ${goal - current} أكواب`}
          </span>
          <span className="font-bold text-sky-700 dark:text-sky-300">{pct}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-300 to-blue-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Quick add + reset */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={addCup}
          disabled={current >= goal}
          className={cn(
            'flex-1 rounded-xl py-2 text-xs font-bold transition-all active:scale-[0.98]',
            current >= goal
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'bg-sky-600 text-white hover:bg-sky-700',
          )}
        >
          + كوب 💧
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-gray-200 px-3 py-2 text-[10px] font-bold text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          ↩️
        </button>
      </div>

      {/* Skin benefit */}
      <div className="mt-2 rounded-lg bg-sky-50 p-2 dark:bg-sky-950">
        <p className="text-center text-[10px] text-sky-700 dark:text-sky-300">
          💡 {goal} أكواب ماء = بشرة أكثر نضارة ومرونة
        </p>
      </div>
    </div>
  );
}
