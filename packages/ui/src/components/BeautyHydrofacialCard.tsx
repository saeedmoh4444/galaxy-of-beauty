'use client';
import { cn } from '@galaxy/shared';
export function BeautyHydrofacialCard({
  className = '',
  heading = 'الهيدروفيشل',
  subtitle = 'تنظيف عميق بضغط الماء',
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
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{heading}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'ينظف المسام بعمق — بدون ألم أو احمرار',
              en: 'Deeply cleans pores — painless, no redness',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يرطب ويغذي — في نفس الجلسة',
              en: 'Hydrates and nourishes — in the same session',
            },
          },
          {
            emoji: '️',
            text: { ar: '30-45 دقيقة — نتائج فورية', en: '30-45 minutes — instant results' },
          },
          {
            emoji: '',
            text: {
              ar: 'مرة شهرياً — للحفاظ على النتائج',
              en: 'Once a month — to maintain results',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
