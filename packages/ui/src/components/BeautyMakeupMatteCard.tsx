'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupMatteCard({
  className = '',
  heading = 'مكياج مطفي',
  subtitle = 'إطلالة مخملية أنيقة',
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
        'rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">{heading}</h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: { ar: 'برايمر مطفي — يتحكم باللمعان', en: 'Matte primer — controls shine' },
          },
          {
            emoji: '',
            text: {
              ar: 'بودرة شفافة — لتثبيت المكياج',
              en: 'Translucent powder — to set the makeup',
            },
          },
          {
            emoji: '',
            text: { ar: 'أحمر شفاه مطفي — يدوم ساعات', en: 'Matte lipstick — lasts for hours' },
          },
          {
            emoji: '',
            text: {
              ar: 'ورق نشاف — بدل إضافة بودرة',
              en: 'Blotting paper — instead of adding powder',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-gray-800 dark:text-gray-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
