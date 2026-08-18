'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupSettingCard({
  className = '',
  heading = 'تثبيت المكياج',
  subtitle = 'لمكياج يدوم طوال اليوم',
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
        'rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">{heading}</h4>
          <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: { ar: 'سبراي التثبيت — آخر خطوة', en: 'Setting spray — the final step' },
          },
          {
            emoji: '',
            text: { ar: 'برايمر — أساس التثبيت', en: 'Primer — the foundation of staying power' },
          },
          {
            emoji: '',
            text: {
              ar: 'بودرة شفافة — للمنطقة الدهنية فقط',
              en: 'Translucent powder — only on oily areas',
            },
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
            className="flex items-center gap-2 rounded-lg bg-fuchsia-50 px-3 py-2 dark:bg-fuchsia-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-fuchsia-800 dark:text-fuchsia-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
