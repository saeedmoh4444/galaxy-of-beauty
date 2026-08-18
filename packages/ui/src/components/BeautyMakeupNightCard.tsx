'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupNightCard({
  className = '',
  heading = 'مكياج السهرة',
  subtitle = 'إطلالة جريئة للمناسبات',
  locale = 'ar',
}: {
  className?: string;
  heading?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
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
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{heading}</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'فاونديشن كامل التغطية — يتحمل التصوير',
              en: 'Full-coverage foundation — camera-proof',
            },
          },
          {
            emoji: '',
            text: { ar: 'سموكي آيز — جريء وجذاب', en: 'Smoky eyes — bold and captivating' },
          },
          {
            emoji: '',
            text: {
              ar: 'هايلايتر — على أعلى نقاط الوجه',
              en: 'Highlighter — on the highest points of the face',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'أحمر شفاه مطفي — يدوم طوال السهرة',
              en: 'Matte lipstick — lasts the whole evening',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-indigo-800 dark:text-indigo-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
