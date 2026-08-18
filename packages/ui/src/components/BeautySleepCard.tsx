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
  action: { ar: string; en: string };
  duration: { ar: string; en: string };
}

const ROUTINE: NightRoutine[] = [
  {
    time: '21:00',
    emoji: '',
    action: { ar: 'إطفاء الشاشات', en: 'Turn off screens' },
    duration: { ar: '—', en: '—' },
  },
  {
    time: '21:15',
    emoji: '',
    action: { ar: 'روتين العناية الليلي', en: 'Night skincare routine' },
    duration: { ar: '15 دقيقة', en: '15 min' },
  },
  {
    time: '21:30',
    emoji: '️',
    action: { ar: 'استرخاء وتأمل', en: 'Relax and meditate' },
    duration: { ar: '10 دقيقة', en: '10 min' },
  },
  {
    time: '21:45',
    emoji: '',
    action: { ar: 'قراءة هادئة', en: 'Quiet reading' },
    duration: { ar: '20 دقيقة', en: '20 min' },
  },
  {
    time: '22:15',
    emoji: '',
    action: { ar: 'شاي أعشاب', en: 'Herbal tea' },
    duration: { ar: '10 دقيقة', en: '10 min' },
  },
  {
    time: '22:30',
    emoji: '',
    action: { ar: 'نوم عميق', en: 'Deep sleep' },
    duration: { ar: '8 ساعات', en: '8 hours' },
  },
];

interface BeautySleepCardProps {
  bedtime?: string;
  wakeTime?: string;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Label for the bedtime stat */
  bedtimeLabel?: string;
  /** Label for the wake time stat */
  wakeTimeLabel?: string;
  /** Routine timeline heading */
  routineTitle?: string;
  /** "Why it matters" heading */
  whyTitle?: string;
  /** Beauty sleep explanation text */
  sleepTipText?: string;
  /** Footer quote */
  quoteText?: string;
  /** Display locale for routine step labels */
  locale?: 'ar' | 'en';
}

export function BeautySleepCard({
  bedtime = '22:30',
  wakeTime = '06:30',
  className = '',
  title = 'نوم الجمال',
  subtitle = 'روتينكِ المسائي لبشرة مشرقة',
  bedtimeLabel = 'النوم',
  wakeTimeLabel = 'الاستيقاظ',
  routineTitle = 'روتينكِ الليلي',
  whyTitle = 'لماذا نوم الجمال مهم؟',
  sleepTipText = 'أثناء النوم، بشرتكِ تجدد نفسها. 8 ساعات نوم = بشرة مشرقة + عيون أقل انتفاخاً + كولاجين طبيعي.',
  quoteText = '“النوم سر من أسرار الجمال”',
  locale = 'ar',
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
        <h4 className="mt-1 text-sm font-bold text-indigo-800 dark:text-indigo-200">{title}</h4>
        <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{subtitle}</p>
      </div>

      {/* Sleep stats */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{bedtimeLabel}</p>
          <p className="text-lg font-bold text-indigo-800 dark:text-indigo-200">{bedtime}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{wakeTimeLabel}</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{wakeTime}</p>
        </div>
      </div>

      {/* Routine timeline */}
      <div className="mt-3 space-y-1.5">
        <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">{routineTitle}</p>
        {ROUTINE.map((step, i) => {
          const isBedtime = step.action.ar === 'نوم عميق';

          return (
            <div
              key={step.action.ar}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2',
                isBedtime ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-white/40 dark:bg-gray-800/40',
              )}
            >
              <span className="text-sm w-6 text-center shrink-0" aria-hidden="true">
                {step.emoji}
              </span>
              <span className="flex-1 text-[10px] text-text-primary dark:text-gray-100">
                {step.action[locale]}
              </span>
              <span className="text-[10px] text-text-tertiary dark:text-gray-500 w-12 text-right">
                {step.duration[locale]}
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
        <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">{whyTitle}</p>
        <p className="mt-0.5 text-[10px] text-indigo-600 dark:text-indigo-400">{sleepTipText}</p>
      </div>

      <p className="mt-2 text-center text-[9px] text-indigo-500 dark:text-indigo-400">
        {quoteText}
      </p>
    </div>
  );
}
