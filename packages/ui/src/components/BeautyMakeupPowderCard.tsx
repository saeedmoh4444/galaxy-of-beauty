'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupPowderCard({
  className = '',
  heading = 'البودرة',
  subtitle = 'أنواعها واستخداماتها',
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
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{heading}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'شفافة', en: 'Translucent' },
            tip: { ar: 'تثبت بدون لون', en: 'Sets makeup without color' },
          },
          {
            emoji: '',
            label: { ar: 'ملونة', en: 'Tinted' },
            tip: { ar: 'تغطية إضافية', en: 'Extra coverage' },
          },
          {
            emoji: '',
            label: { ar: 'مدمجة', en: 'Pressed' },
            tip: { ar: 'كريم + بودرة', en: 'Cream + powder' },
          },
          {
            emoji: '',
            label: { ar: 'طبيعية', en: 'Natural' },
            tip: { ar: 'مكونات نباتية', en: 'Plant-based ingredients' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-pink-50 px-2.5 py-2 dark:bg-pink-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-pink-800 dark:text-pink-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-pink-600 dark:text-pink-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
