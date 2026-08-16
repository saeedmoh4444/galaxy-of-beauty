'use client';

import { cn } from '@galaxy/shared';

/**
 * Prayer Time Reminder — gentle prayer time notifications during appointments.
 * From Phase W9: The Small Details — Thoughtful Touches.
 *
 * Usage:
 *   <PrayerTimeReminder nextPrayer="العصر" time="15:30" />
 */

interface PrayerTimeReminderProps {
  nextPrayer: string;
  time: string;
  /** Minutes until next prayer */
  minutesUntil?: number;
  onDismiss?: () => void;
  className?: string;
}

export function PrayerTimeReminder({
  nextPrayer,
  time,
  minutesUntil,
  onDismiss,
  className = '',
}: PrayerTimeReminderProps): JSX.Element {
  const isSoon = minutesUntil !== undefined && minutesUntil <= 15;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        isSoon
          ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950'
          : 'border-emerald-100 bg-white dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true"></span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              موعد الصلاة
            </h4>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
              {nextPrayer} — {time}
            </p>
          </div>
        </div>
        {isSoon && (
          <span className="shrink-0 animate-pulse rounded-full bg-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-800 dark:text-amber-200">
            قريباً
          </span>
        )}
      </div>

      {/* Countdown */}
      {minutesUntil !== undefined && (
        <div className="mt-2 rounded-xl bg-emerald-50 p-2.5 text-center dark:bg-emerald-950">
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{minutesUntil}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">دقيقة حتى الأذان</p>
        </div>
      )}

      {/* Gentle reminder */}
      <div className="mt-2 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
        <p className="text-center text-[10px] text-emerald-700 dark:text-emerald-300">
          سنذكركِ قبل الأذان بـ 10 دقائق — لتستعدي للصلاة براحة
        </p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 w-full rounded-lg border border-emerald-200 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
        >
          شكراً
        </button>
      )}

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        راحتكِ الروحية جزء من تجربتكِ
      </p>
    </div>
  );
}
