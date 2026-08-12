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
  task: string;
  emoji: string;
}

const CHALLENGES: ChallengeDay[] = [
  { day: 1, task: 'اشربي 8 أكواب ماء', emoji: '' },
  { day: 2, task: 'نظفي بشرتكِ مرتين', emoji: '' },
  { day: 3, task: 'طبقي واقي شمس', emoji: '️' },
  { day: 4, task: 'تأملي 10 دقائق', emoji: '' },
  { day: 5, task: 'قناع وجه طبيعي', emoji: '' },
  { day: 6, task: 'امشي 30 دقيقة', emoji: '‍️' },
  { day: 7, task: 'دللي شعركِ', emoji: '' },
  { day: 8, task: 'نامي 8 ساعات', emoji: '' },
  { day: 9, task: 'لا سكر اليوم', emoji: '' },
  { day: 10, task: 'اكتبي 3 أشياء تحبينها في نفسكِ', emoji: '' },
  { day: 11, task: 'تقشير لطيف للبشرة', emoji: '' },
  { day: 12, task: 'جربي تسريحة جديدة', emoji: '‍️' },
  { day: 13, task: 'اشربي شاي أخضر', emoji: '' },
  { day: 14, task: 'صوري بشرتكِ (قبل/بعد)', emoji: '' },
  { day: 15, task: 'جلسة تأمل مسائية', emoji: '️' },
];

interface BeautyChallengeCardProps {
  completedDays?: number;
  totalDays?: number;
  onCheckIn?: (day: number) => void;
  className?: string;
}

export function BeautyChallengeCard({
  completedDays = 0,
  totalDays = 30,
  onCheckIn,
  className = '',
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
        <span className="text-3xl" aria-hidden="true">
          
        </span>
        <h4 className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
          تحدي 30 يوم
        </h4>
        <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
          رحلة 30 يوم للعناية بنفسكِ
        </p>
      </div>

      {/* Progress */}
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
            اليوم {today} من {totalDays}
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
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400"> مهمة اليوم</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              {todayTask.emoji}
            </span>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              {todayTask.task}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCheckIn?.(todayTask.day)}
            className="mt-2 rounded-full bg-emerald-600 px-4 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all"
          >
             أنجزتها!
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
              <p className="mt-0.5 text-[8px] text-text-tertiary dark:text-gray-500">يوم {d.day}</p>
            </div>
          );
        })}
      </div>

      {/* Motivation */}
      <p className="mt-3 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         {30 - completedDays} يوم متبقي — أنتِ قادرة!
      </p>
    </div>
  );
}
