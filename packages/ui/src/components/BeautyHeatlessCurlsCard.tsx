'use client';
import { cn } from '@galaxy/shared';
export function BeautyHeatlessCurlsCard({
  className = '',
  title = 'تمويج بدون حرارة',
  subtitle = 'شعر مموج — بدون ضرر',
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
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'الجوارب', en: 'Socks' },
            tip: { ar: 'طريقة سهلة — لفات ناعمة', en: 'An easy method — soft waves' },
          },
          {
            emoji: '',
            label: { ar: 'الروبن', en: 'Ribbon' },
            tip: { ar: 'شريط طويل — تموجات مثالية', en: 'A long ribbon — perfect waves' },
          },
          {
            emoji: '',
            label: { ar: 'لفات القماش', en: 'Fabric wraps' },
            tip: { ar: 'طرية للنوم — مريحة', en: 'Soft for sleeping — comfortable' },
          },
          {
            emoji: '',
            label: { ar: 'قبل النوم', en: 'Before bed' },
            tip: { ar: 'تصفيفة الليل = شعر الصباح', en: 'Tonight’s style = tomorrow’s hair' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-rose-50 px-2.5 py-2 dark:bg-rose-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-rose-600 dark:text-rose-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
