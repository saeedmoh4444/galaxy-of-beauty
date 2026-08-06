'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Habit Tracker Card — track daily beauty habits with streak.
 * From Phase W3: Health & Wellness — Mental Wellness & Beauty.
 *
 * Usage:
 *   <BeautyHabitTrackerCard habits={[{ name: 'واقي شمس', emoji: '☀️', done: true }]} />
 */

interface Habit { name: string; emoji: string; done: boolean; }

interface BeautyHabitTrackerCardProps { habits: Habit[]; onToggle?: (name: string) => void; className?: string; }

export function BeautyHabitTrackerCard({ habits, onToggle, className = '' }: BeautyHabitTrackerCardProps): JSX.Element {
  const [items, setItems] = useState(habits);
  const done = items.filter((h) => h.done).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

  const toggle = (name: string) => {
    setItems((prev) => prev.map((h) => h.name === name ? { ...h, done: !h.done } : h));
    onToggle?.(name);
  };

  return (
    <div className={cn('rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">✅</span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">عاداتي اليومية</h4>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{done}/{items.length} · {pct}%</p>
          </div>
        </div>
      </div>

      <div className="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 space-y-1">
        {items.map((h) => (
          <button key={h.name} type="button" onClick={() => toggle(h.name)} className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-all', h.done ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-gray-50 dark:bg-gray-800')}>
            <span className="text-sm">{h.emoji}</span>
            <span className={cn('flex-1 text-left text-[10px]', h.done ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-text-primary dark:text-gray-100')}>{h.name}</span>
            <span className={cn('text-xs', h.done ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600')}>{h.done ? '✅' : '○'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
