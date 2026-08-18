'use client';

import { cn } from '@galaxy/shared';

interface BeautyHandsCareCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyHandsCareCard({
  className = '',
  title = 'عناية باليدين',
  subtitle = 'أيدي ناعمة وجميلة',
  locale = 'ar',
}: BeautyHandsCareCardProps): JSX.Element {
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
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{title}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'كريم بعد الغسيل', en: 'Cream after washing' },
            tip: { ar: 'كل مرة تغسلين يديك', en: 'Every time you wash your hands' },
          },
          {
            emoji: '',
            label: { ar: 'قفازات', en: 'Gloves' },
            tip: { ar: 'للتنظيف والغسيل', en: 'For cleaning and washing' },
          },
          {
            emoji: '️',
            label: { ar: 'واقي شمس', en: 'Sunscreen' },
            tip: { ar: 'ظهر اليدين يظهر العمر', en: 'The back of the hands shows age' },
          },
          {
            emoji: '',
            label: { ar: 'تقليم منتظم', en: 'Regular trimming' },
            tip: { ar: 'أسبوعياً للحفاظ على الشكل', en: 'Weekly to keep the shape' },
          },
        ].map((t) => (
          <div key={t.label.ar} className="rounded-lg bg-sky-50 px-2.5 py-2 dark:bg-sky-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-sky-800 dark:text-sky-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-sky-600 dark:text-sky-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
