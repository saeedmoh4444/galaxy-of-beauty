'use client';
import { cn } from '@galaxy/shared';
export function BeautyAfterLaserCard({
  className = '',
  title = 'بعد الليزر',
  subtitle = 'عناية خاصة بعد جلسة الليزر',
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
        'rounded-2xl border border-red-100 bg-white p-4 dark:border-red-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-red-700 dark:text-red-300">{title}</h4>
          <p className="text-[10px] text-red-500 dark:text-red-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: 'تجنبي الشمس — أسبوع كامل بعد الجلسة',
              en: 'Avoid the sun — a full week after the session',
            },
          },
          { emoji: '', text: { ar: 'SPF 50+ — ضرورة مطلقة', en: 'SPF 50+ — an absolute must' } },
          {
            emoji: '',
            text: {
              ar: 'لا تقشري — لا منتجات قوية 5 أيام',
              en: 'No exfoliation — no strong products for 5 days',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مرطب لطيف — ألوفيرا أو بانثينول',
              en: 'Gentle moisturizer — aloe vera or panthenol',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-red-800 dark:text-red-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
