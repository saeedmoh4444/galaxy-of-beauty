'use client';
import { cn } from '@galaxy/shared';
export function BeautyFiftiesCard({
  className = '',
  title = 'العناية في الخمسينات',
  subtitle = 'جمال ناضج — عناية فاخرة',
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
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'زيوت غنية — سكوالين، زيت الأرغان، ثمر الورد',
              en: 'Rich oils — squalane, argan oil, rosehip',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مرطبات كثيفة — كريمات وليس جل',
              en: 'Thick moisturizers — creams, not gels',
            },
          },
          {
            emoji: '🩺',
            text: {
              ar: 'فحوصات هرمونية — الجمال بعد انقطاع الطمث',
              en: 'Hormone checkups — beauty after menopause',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'الجمال الحقيقي — الثقة والعناية الذاتية',
              en: 'True beauty — confidence and self-care',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-amber-800 dark:text-amber-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
