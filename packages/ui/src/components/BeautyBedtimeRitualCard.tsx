'use client';
import { cn } from '@galaxy/shared';
export function BeautyBedtimeRitualCard({
  className = '',
  title = 'طقوس النوم',
  subtitle = 'روتين الجمال قبل النوم',
  locale = 'ar',
}: {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">{title}</h4>
          <p className="text-[10px] text-violet-500 dark:text-violet-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'نظفي وجهك — مزدوج: زيت + غسول',
              en: 'Cleanse your face — double cleanse: oil + cleanser',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'سيروم ليلي — وقت الإصلاح أثناء النوم',
              en: 'Night serum — repair time while you sleep',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تدليك 3 دقائق — يحفز الدورة الدموية',
              en: '3-minute massage — boosts circulation',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'أطفئي الجوال — الضوء الأزرق يمنع الميلاتونين',
              en: 'Turn off your phone — blue light blocks melatonin',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-200 text-[9px] font-bold text-violet-700 dark:bg-violet-800 dark:text-violet-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-violet-800 dark:text-violet-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
