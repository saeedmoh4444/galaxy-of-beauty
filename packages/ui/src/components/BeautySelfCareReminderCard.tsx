'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Self-Care Reminder Card — gentle daily self-care nudges.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautySelfCareReminderCard reminder="خذي 5 دقائق للتنفس العميق" time="10:00 صباحاً" />
 */

interface BeautySelfCareReminderCardProps {
  reminder: string;
  emoji?: string;
  time?: string;
  onSnooze?: () => void;
  title?: string;
  snoozeText?: string;
  className?: string;
}

export function BeautySelfCareReminderCard({
  reminder,
  emoji = '',
  time,
  onSnooze,
  title = 'تذكير بالعناية',
  snoozeText = 'ذكّريني لاحقاً',
  className = '',
}: BeautySelfCareReminderCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-pink-50 p-4 dark:border-brand-900 dark:from-brand-950 dark:to-pink-950',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0">{emoji}</span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-brand-800 dark:text-brand-200">{title}</h4>
          <p className="mt-1 text-xs leading-relaxed text-brand-700 dark:text-brand-300">
            {reminder}
          </p>
          {time && <p className="mt-1 text-[10px] text-brand-500 dark:text-brand-400"> {time}</p>}
        </div>
      </div>
      {onSnooze && (
        <button
          type="button"
          onClick={onSnooze}
          className="mt-2 w-full rounded-lg border border-brand-200 py-1.5 text-[10px] font-bold text-brand-600 hover:bg-white/60 dark:hover:bg-gray-800/60 dark:border-brand-800 dark:text-brand-400 transition-colors"
        >
          {snoozeText}
        </button>
      )}
    </div>
  );
}
