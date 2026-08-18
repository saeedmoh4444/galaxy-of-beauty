'use client';

import { cn } from '@galaxy/shared';

/**
 * Skin Journal Card — daily skin & beauty diary for tracking progress.
 * From Phase W3: Health & Wellness — Beauty & Mental Health Journal.
 *
 * Usage:
 *   <SkinJournalCard entries={14} />
 */

interface SkinJournalCardProps {
  entries: number;
  streak?: number;
  lastMood?: string;
  onAddEntry?: () => void;
  title?: string;
  subtitle?: string;
  entriesLabel?: string;
  streakLabel?: string;
  moodLabel?: string;
  moodQuestion?: string;
  addEntryText?: string;
  footerText?: string;
  className?: string;
}

const MOODS = ['', '', '', '', ''];

export function SkinJournalCard({
  entries,
  streak = 0,
  lastMood,
  onAddEntry,
  className = '',
  title = 'يوميات بشرتي',
  subtitle = 'تابعي رحلة بشرتكِ',
  entriesLabel = 'مدخل',
  streakLabel = 'يوم متتالي',
  moodLabel = 'آخر مزاج',
  moodQuestion = 'كيف تشعر بشرتكِ اليوم؟',
  addEntryText = '️ أضيفي مدخلاً جديداً',
  footerText = 'تتبعي بشرتكِ يومياً — التغييرات الصغيرة تصنع فرقاً كبيراً',
}: SkinJournalCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-5 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true"></span>
          <div>
            <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
            <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-purple-50 p-2.5 text-center dark:bg-purple-950">
          <p className="text-lg font-bold text-purple-800 dark:text-purple-200">{entries}</p>
          <p className="text-[9px] text-purple-600 dark:text-purple-400">{entriesLabel}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-2.5 text-center dark:bg-amber-950">
          <p className="text-lg font-bold text-amber-800 dark:text-amber-200"> {streak}</p>
          <p className="text-[9px] text-amber-600 dark:text-amber-400">{streakLabel}</p>
        </div>
        <div className="rounded-xl bg-pink-50 p-2.5 text-center dark:bg-pink-950">
          <p className="text-lg">{lastMood || '—'}</p>
          <p className="text-[9px] text-pink-600 dark:text-pink-400">{moodLabel}</p>
        </div>
      </div>

      {/* Mood selector */}
      <div className="mt-3 rounded-xl bg-purple-50 p-3 dark:bg-purple-950">
        <p className="text-center text-[10px] font-bold text-purple-700 dark:text-purple-300">
          {moodQuestion}
        </p>
        <div className="mt-2 flex justify-center gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg hover:bg-purple-100 dark:bg-gray-800 dark:hover:bg-purple-900 transition-colors active:scale-95"
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onAddEntry}
        className="mt-3 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
      >
        {addEntryText}
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
