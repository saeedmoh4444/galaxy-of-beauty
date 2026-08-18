'use client';

import { cn } from '@galaxy/shared';

interface BeautyTeethCareCardProps {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}

export function BeautyTeethCareCard({
  className = '',
  locale = 'ar',
  title = 'ابتسامة مشرقة',
  subtitle = 'عناية بالأسنان لجمال ابتسامتك',
}: BeautyTeethCareCardProps): JSX.Element {
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
            emoji: '🪥',
            label: { ar: 'تنظيف مرتين', en: 'Brush twice' },
            tip: { ar: 'صباحاً ومساءً — دقيقتان', en: 'Morning and night — two minutes' },
          },
          {
            emoji: '',
            label: { ar: 'خيط الأسنان', en: 'Dental floss' },
            tip: { ar: 'يومياً — يمنع التسوس', en: 'Daily — prevents cavities' },
          },
          {
            emoji: '',
            label: { ar: 'تبييض طبيعي', en: 'Natural whitening' },
            tip: { ar: 'فراولة + بيكربونات', en: 'Strawberry + baking soda' },
          },
          {
            emoji: '‍️',
            label: { ar: 'فحص دوري', en: 'Regular checkup' },
            tip: { ar: 'كل 6 أشهر عند الطبيب', en: 'Every 6 months at the dentist' },
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
