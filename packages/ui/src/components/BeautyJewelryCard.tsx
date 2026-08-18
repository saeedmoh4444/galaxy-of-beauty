'use client';

import { cn } from '@galaxy/shared';

interface BeautyJewelryCardProps {
  className?: string;
  heading?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyJewelryCard({
  className = '',
  heading = 'تنسيق الإكسسوارات',
  subtitle = 'اللمسة الأخيرة لإطلالتك',
  locale = 'ar',
}: BeautyJewelryCardProps): JSX.Element {
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
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{heading}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'أقراط', en: 'Earrings' },
            tip: { ar: 'طويلة = وجه أنحف', en: 'Long ones = slimmer face' },
          },
          {
            emoji: '',
            label: { ar: 'عقد', en: 'Necklace' },
            tip: { ar: 'يناسب الفتحة', en: 'Matches the neckline' },
          },
          {
            emoji: '',
            label: { ar: 'ساعة', en: 'Watch' },
            tip: { ar: 'كلاسيك = لكل مناسبة', en: 'Classic = for every occasion' },
          },
          {
            emoji: '',
            label: { ar: 'خواتم', en: 'Rings' },
            tip: { ar: '2-3 كحد أقصى', en: '2-3 at most' },
          },
        ].map((t) => (
          <div key={t.label.ar} className="rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
