'use client';
import { cn } from '@galaxy/shared';
export function BeautyAfterWaxCard({
  className = '',
  title = 'بعد إزالة الشعر',
  subtitle = 'بشرة ناعمة — بدون التهاب',
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
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'كريم مهدئ — ألوفيرا أو بانثينول',
              en: 'Soothing cream — aloe vera or panthenol',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'لا تعرقي — 24 ساعة بدون رياضة',
              en: 'Avoid sweating — no exercise for 24 hours',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ملابس قطنية واسعة — للتهوية',
              en: 'Loose cotton clothing — for breathability',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تقشير لطيف — بعد 3 أيام لمنع الشعر تحت الجلد',
              en: 'Gentle exfoliation — after 3 days to prevent ingrown hairs',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2 dark:bg-pink-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-pink-800 dark:text-pink-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
