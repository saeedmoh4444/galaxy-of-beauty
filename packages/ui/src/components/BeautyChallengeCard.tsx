'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Challenge Card — 30-day beauty & self-care challenge.
 * From Phase W6: Education & Empowerment — Galaxy Beauty Academy.
 *
 * Usage:
 *   <BeautyChallengeCard
 *     challenge={{ title: 'تحدي 30 يوم عناية', days: 30, completed: 17 }}
 *   />
 */

interface ChallengeDay {
  day: number;
  task: { ar: string; en: string };
  emoji: string;
}

const CHALLENGES: ChallengeDay[] = [
  { day: 1, task: { ar: 'اشربي 8 أكواب ماء', en: 'Drink 8 glasses of water' }, emoji: '' },
  { day: 2, task: { ar: 'نظفي بشرتكِ مرتين', en: 'Cleanse your skin twice' }, emoji: '' },
  { day: 3, task: { ar: 'طبقي واقي شمس', en: 'Apply sunscreen' }, emoji: '️' },
  { day: 4, task: { ar: 'تأملي 10 دقائق', en: 'Meditate for 10 minutes' }, emoji: '' },
  { day: 5, task: { ar: 'قناع وجه طبيعي', en: 'Use a natural face mask' }, emoji: '' },
  { day: 6, task: { ar: 'امشي 30 دقيقة', en: 'Walk for 30 minutes' }, emoji: '‍️' },
  { day: 7, task: { ar: 'دللي شعركِ', en: 'Pamper your hair' }, emoji: '' },
  { day: 8, task: { ar: 'نامي 8 ساعات', en: 'Sleep for 8 hours' }, emoji: '' },
  { day: 9, task: { ar: 'لا سكر اليوم', en: 'No sugar today' }, emoji: '' },
  {
    day: 10,
    task: { ar: 'اكتبي 3 أشياء تحبينها في نفسكِ', en: 'Write 3 things you love about yourself' },
    emoji: '',
  },
  { day: 11, task: { ar: 'تقشير لطيف للبشرة', en: 'Gentle skin exfoliation' }, emoji: '' },
  { day: 12, task: { ar: 'جربي تسريحة جديدة', en: 'Try a new hairstyle' }, emoji: '‍️' },
  { day: 13, task: { ar: 'اشربي شاي أخضر', en: 'Drink green tea' }, emoji: '' },
  {
    day: 14,
    task: { ar: 'صوري بشرتكِ (قبل/بعد)', en: 'Photo your skin (before/after)' },
    emoji: '',
  },
  { day: 15, task: { ar: 'جلسة تأمل مسائية', en: 'Evening meditation session' }, emoji: '️' },
];

interface BeautyChallengeCardProps {
  completedDays?: number;
  totalDays?: number;
  onCheckIn?: (day: number) => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Label prefixing the current day counter */
  dayLabel?: string;
  /** Word joining day counter and total, e.g. 'of' */
  ofLabel?: string;
  /** Label for today's task section */
  taskLabel?: string;
  /** Check-in button label */
  doneLabel?: string;
  /** Word prefixing a day number in the streak grid */
  dayWordLabel?: string;
  /** Text after the remaining-days counter */
  daysRemainingLabel?: string;
  /** Locale for internal task data strings */
  locale?: 'ar' | 'en';
}

export function BeautyChallengeCard({
  completedDays = 0,
  totalDays = 30,
  onCheckIn,
  className = '',
  title = 'تحدي 30 يوم',
  subtitle = 'رحلة 30 يوم للعناية بنفسكِ',
  dayLabel = 'اليوم',
  ofLabel = 'من',
  taskLabel = ' مهمة اليوم',
  doneLabel = 'أنجزتها!',
  dayWordLabel = 'يوم',
  daysRemainingLabel = 'يوم متبقي — أنتِ قادرة!',
  locale = 'ar',
}: BeautyChallengeCardProps): JSX.Element {
  const pct = Math.round((completedDays / totalDays) * 100);
  const today = completedDays + 1 <= totalDays ? completedDays + 1 : totalDays;
  const todayTask = CHALLENGES.find((c) => c.day === today);

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-5 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
        <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
      </div>

      {/* Progress */}
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
            {dayLabel} {today} {ofLabel} {totalDays}
          </span>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
            {completedDays}/{totalDays}
          </span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Today's task */}
      {todayTask && (
        <div className="mt-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 p-4 text-center dark:from-emerald-950 dark:to-green-950">
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{taskLabel}</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              {todayTask.emoji}
            </span>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              {todayTask.task[locale]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCheckIn?.(todayTask.day)}
            className="mt-2 rounded-full bg-emerald-600 px-4 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all"
          >
            {doneLabel}
          </button>
        </div>
      )}

      {/* Streak */}
      <div className="mt-3 grid grid-cols-7 gap-1">
        {CHALLENGES.slice(0, 7).map((d) => {
          const isCompleted = d.day <= completedDays;
          const isToday = d.day === today;

          return (
            <div key={d.day} className="text-center">
              <div
                className={cn(
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all',
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400'
                    : isToday
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600',
                )}
              >
                {isCompleted ? '' : d.emoji}
              </div>
              <p className="mt-0.5 text-[8px] text-text-tertiary dark:text-gray-500">
                {dayWordLabel} {d.day}
              </p>
            </div>
          );
        })}
      </div>

      {/* Motivation */}
      <p className="mt-3 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {30 - completedDays} {daysRemainingLabel}
      </p>
    </div>
  );
}
