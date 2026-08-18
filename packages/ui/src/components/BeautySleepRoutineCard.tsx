'use client';
import { cn } from '@galaxy/shared';
export function BeautySleepRoutineCard({
  className = '',
  title = 'روتين ما قبل النوم',
  subtitle = '30 دقيقة — لبشرة أجمل صباحاً',
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
              ar: 'نظفي وجهك — إزالة المكياج بالكامل',
              en: 'Cleanse your face — remove makeup completely',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'سيروم + مرطب ليلي — بشرة تتجدد ليلاً',
              en: 'Serum + night moisturizer — skin renews overnight',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'أطفئي الجوال — 30 دقيقة قبل النوم',
              en: 'Turn off your phone — 30 minutes before bed',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'أجواء هادئة — شمعة، كتاب، تأمل',
              en: 'Calm atmosphere — candle, book, meditation',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-violet-800 dark:text-violet-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
