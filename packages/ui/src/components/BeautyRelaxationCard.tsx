'use client';

import { cn } from '@galaxy/shared';

interface BeautyRelaxationCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyRelaxationCard({
  className = '',
  title = 'طقوس الاسترخاء',
  subtitle = 'روتين مسائي للاسترخاء',
  locale = 'ar',
}: BeautyRelaxationCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{title}</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          {
            emoji: '',
            step: { ar: 'حمام دافئ بملح إنكليزي', en: 'Warm bath with Epsom salt' },
            time: { ar: '20 دقيقة', en: '20 minutes' },
          },
          {
            emoji: '️',
            step: { ar: 'إطفاء الأضواء وإشعال شمعة', en: 'Dim the lights and light a candle' },
            time: { ar: '—', en: '—' },
          },
          {
            emoji: '',
            step: { ar: 'ترطيب الجسم بالكامل', en: 'Moisturize the whole body' },
            time: { ar: '5 دقائق', en: '5 minutes' },
          },
          {
            emoji: '',
            step: { ar: 'الاستعداد للنوم العميق', en: 'Prepare for deep sleep' },
            time: { ar: '8 ساعات', en: '8 hours' },
          },
        ].map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-[9px] font-bold text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300">
              {i + 1}
            </span>
            <span className="flex-1 text-[10px] text-indigo-800 dark:text-indigo-200">
              {s.step[locale]}
            </span>
            <span className="text-[9px] text-indigo-500 dark:text-indigo-400">
              {s.time[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
