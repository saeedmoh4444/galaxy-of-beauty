'use client';
import { cn } from '@galaxy/shared';
export function BeautyEyeMassageCard({
  className = '',
  title = 'مساج العين',
  subtitle = '3 دقائق — لعيون مشرقة',
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
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: 'البنصر — الأخف للتربيت على محيط العين',
              en: 'Ring finger — the gentlest for tapping around the eye',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'من الداخل للخارج — بحركة دائرية',
              en: 'From inner to outer corner — in a circular motion',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مع كريم أو زيت — لتزلق الأصابع',
              en: 'With cream or oil — so fingers glide',
            },
          },
          {
            emoji: '️',
            text: {
              ar: '3 دقائق — صباحاً لتقليل الانتفاخ',
              en: '3 minutes — in the morning to reduce puffiness',
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
