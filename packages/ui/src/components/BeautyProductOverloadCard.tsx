'use client';
import { cn } from '@galaxy/shared';
export function BeautyProductOverloadCard({
  className = '',
  title = 'تحميل المنتجات',
  subtitle = 'كثرة المنتجات — ضرر أكثر من نفع',
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
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'لا تخلطي أكثر من 3 منتجات نشطة في الجلسة',
              en: 'Do not layer more than 3 active products per routine',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'قاعدة: منتج فعال واحد في الصباح — وآخر في المساء',
              en: 'Rule: one active in the morning — another in the evening',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'نظام التدوير: يوم ريتينول — يوم تقشير — يوم راحة',
              en: 'Rotation: a retinol day — an exfoliating day — a rest day',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'البشرة تفضل البساطة — الأقل هو الأكثر',
              en: 'Skin prefers simplicity — less is more',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
