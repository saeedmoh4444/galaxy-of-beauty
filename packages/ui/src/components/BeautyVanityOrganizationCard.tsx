'use client';
import { cn } from '@galaxy/shared';
export function BeautyVanityOrganizationCard({
  className = '',
  locale = 'ar',
  title = 'تنظيم التسريحة',
  subtitle = 'ركن جمالكِ المثالي',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🪞</span>
        <div>
          <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{title}</h4>
          <p className="text-[10px] text-brand-500 dark:text-brand-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '☀️',
            text: {
              ar: 'إضاءة طبيعية — ضعي التسريحة قرب النافذة',
              en: 'Natural light — place the vanity near a window',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'أدراج مقسمة — كل فئة في درج',
              en: 'Divided drawers — one category per drawer',
            },
          },
          {
            emoji: '🪞',
            text: {
              ar: 'مرآة مكبرة — للتفاصيل الدقيقة',
              en: 'Magnifying mirror — for fine details',
            },
          },
          {
            emoji: '🧼',
            text: {
              ar: 'نظفي التسريحة أسبوعياً — غبار وبكتيريا',
              en: 'Clean the vanity weekly — dust and bacteria',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-brand-800 dark:text-brand-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
