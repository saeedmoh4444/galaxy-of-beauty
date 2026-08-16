'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Sleep Card — evening self-care routine for beauty sleep.
 * From Phase W3: Health & Wellness — Mental Wellness & Beauty.
 *
 * Usage:
 *   <BeautySleepCard bedtime="22:30" />
 */

interface NightRoutine {
  time: string;
  emoji: string;
  action: string;
  duration: string;
}

const ROUTINE: NightRoutine[] = [
  { time: '21:00', emoji: '', action: 'إطفاء الشاشات', duration: '—' },
  { time: '21:15', emoji: '', action: 'روتين العناية الليلي', duration: '15 دقيقة' },
  { time: '21:30', emoji: '️', action: 'استرخاء وتأمل', duration: '10 دقيقة' },
  { time: '21:45', emoji: '', action: 'قراءة هادئة', duration: '20 دقيقة' },
  { time: '22:15', emoji: '', action: 'شاي أعشاب', duration: '10 دقيقة' },
  { time: '22:30', emoji: '', action: 'نوم عميق', duration: '8 ساعات' },
];

interface BeautySleepCardProps {
  bedtime?: string;
  wakeTime?: string;
  className?: string;
}

export function BeautySleepCard({
  bedtime = '22:30',
  wakeTime = '06:30',
  className = '',
}: BeautySleepCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 dark:border-indigo-900 dark:from-indigo-950 dark:to-purple-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-indigo-800 dark:text-indigo-200">نوم الجمال</h4>
        <p className="text-[10px] text-indigo-500 dark:text-indigo-400">
          روتينكِ المسائي لبشرة مشرقة
        </p>
      </div>

      {/* Sleep stats */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">النوم</p>
          <p className="text-lg font-bold text-indigo-800 dark:text-indigo-200">{bedtime}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">الاستيقاظ</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{wakeTime}</p>
        </div>
      </div>

      {/* Routine timeline */}
      <div className="mt-3 space-y-1.5">
        <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">روتينكِ الليلي</p>
        {ROUTINE.map((step, i) => {
          const isBedtime = step.action === 'نوم عميق';

          return (
            <div
              key={step.action}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2',
                isBedtime ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-white/40 dark:bg-gray-800/40',
              )}
            >
              <span className="text-sm w-6 text-center shrink-0" aria-hidden="true">
                {step.emoji}
              </span>
              <span className="flex-1 text-[10px] text-text-primary dark:text-gray-100">
                {step.action}
              </span>
              <span className="text-[10px] text-text-tertiary dark:text-gray-500 w-12 text-right">
                {step.duration}
              </span>
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 w-12 text-right">
                {step.time}
              </span>
              {/* Connector dot */}
              {i < ROUTINE.length - 1 && (
                <div className="absolute right-0 translate-x-1/2" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>

      {/* Beauty sleep tip */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
          لماذا نوم الجمال مهم؟
        </p>
        <p className="mt-0.5 text-[10px] text-indigo-600 dark:text-indigo-400">
          أثناء النوم، بشرتكِ تجدد نفسها. 8 ساعات نوم = بشرة مشرقة + عيون أقل انتفاخاً + كولاجين
          طبيعي.
        </p>
      </div>

      <p className="mt-2 text-center text-[9px] text-indigo-500 dark:text-indigo-400">
        &ldquo;النوم سر من أسرار الجمال&rdquo;
      </p>
    </div>
  );
}
