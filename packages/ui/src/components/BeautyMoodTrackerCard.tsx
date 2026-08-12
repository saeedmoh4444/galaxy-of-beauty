'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Mood Tracker Card — track how beauty treatments affect your mood.
 * From Phase W3: Health & Wellness — Beauty & Mental Health Journal.
 *
 * Usage:
 *   <BeautyMoodTrackerCard onSelectMood={(mood) => console.log(mood)} />
 */

const MOODS = [
  { emoji: '😊', label: 'سعيدة', value: 5 },
  { emoji: '🙂', label: 'مرتاحة', value: 4 },
  { emoji: '😐', label: 'عادية', value: 3 },
  { emoji: '😔', label: 'حزينة', value: 2 },
  { emoji: '😤', label: 'متوترة', value: 1 },
];

interface BeautyMoodTrackerCardProps {
  onSelectMood?: (mood: { emoji: string; label: string; value: number }) => void;
  lastMood?: string;
  className?: string;
}

export function BeautyMoodTrackerCard({
  onSelectMood,
  lastMood,
  className = '',
}: BeautyMoodTrackerCardProps): JSX.Element {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            🎭
          </span>
          <div>
            <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">كيف تشعرين؟</h4>
            <p className="text-[10px] text-violet-500 dark:text-violet-400">
              {lastMood ? `آخر مزاج: ${lastMood}` : 'تتبعي مزاجكِ بعد كل جلسة'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => {
              setSelected(mood.value);
              onSelectMood?.(mood);
            }}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-all active:scale-95',
              selected === mood.value
                ? 'bg-violet-100 ring-2 ring-violet-300 dark:bg-violet-900 dark:ring-violet-700'
                : 'bg-gray-50 hover:bg-violet-50 dark:bg-gray-800 dark:hover:bg-violet-950',
            )}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-[9px] font-medium text-text-secondary dark:text-gray-300">
              {mood.label}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        🎭 مزاجكِ جزء من رحلة جمالكِ
      </p>
    </div>
  );
}
