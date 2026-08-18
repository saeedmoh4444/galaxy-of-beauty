'use client';
import { cn } from '@galaxy/shared';
export function BeautyPerfumeSaffronCard({
  className = '',
  title = 'الزعفران',
  subtitle = 'الذهب الأحمر في العطور',
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
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">{title}</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'أغلى توابل العالم — يستخدم في العطور الفاخرة',
              en: 'The most expensive spice in the world — used in luxury fragrances',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'رائحة حارة ومعدنية — أنيقة ومميزة',
              en: 'A spicy, metallic scent — elegant and distinctive',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يستخدم في ماسكات الوجه — لتفتيح البشرة',
              en: 'Used in face masks — to brighten the skin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'العربية السعودية — تاريخ طويل مع الزعفران',
              en: 'Saudi Arabia — a long history with saffron',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-orange-800 dark:text-orange-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
