'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupRemoveCard({
  className = '',
  heading = 'إزالة المكياج',
  subtitle = 'روتين الإزالة الصحيح',
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
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{heading}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '🫒',
            text: {
              ar: 'زيت تنظيف — الخطوة الأولى تذيب المكياج',
              en: 'Cleansing oil — the first step dissolves makeup',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'غسول مائي — الخطوة الثانية تنظف بعمق',
              en: 'Water-based cleanser — the second step cleans deeply',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'العين أولاً — اضغطي 10 ثوانٍ ثم امسحي',
              en: 'Eyes first — press for 10 seconds, then wipe',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'قطعة قماش ناعمة — وليس مناديل ورقية',
              en: 'A soft cloth — not paper tissues',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-teal-800 dark:text-teal-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
