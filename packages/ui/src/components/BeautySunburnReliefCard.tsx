'use client';
import { cn } from '@galaxy/shared';
export function BeautySunburnReliefCard({
  className = '',
  locale = 'ar',
  title = 'علاج حروق الشمس',
  subtitle = 'إسعاف سريع للبشرة المحروقة',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
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
            emoji: '️',
            text: {
              ar: 'كمادات باردة — 15 دقيقة كل ساعة',
              en: 'Cold compresses — 15 minutes every hour',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'جل الألوفيرا — مبرد في الثلاجة',
              en: 'Aloe vera gel — chilled in the fridge',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'اشربي ماء كثيراً — الترطيب من الداخل',
              en: 'Drink plenty of water — hydrate from within',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'لا تقشري — اتركي الجلد يتجدد طبيعياً',
              en: "Don't exfoliate — let the skin renew naturally",
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
