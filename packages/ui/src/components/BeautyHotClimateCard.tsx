'use client';
import { cn } from '@galaxy/shared';
export function BeautyHotClimateCard({
  className = '',
  heading = 'عناية في الحر',
  subtitle = 'بشرة محمية في الصيف الحار',
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
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">{heading}</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: { ar: 'SPF 50+ — جدديه كل ساعتين', en: 'SPF 50+ — reapply every two hours' },
          },
          {
            emoji: '',
            text: {
              ar: 'سبراي مرطب — للانتعاش أثناء اليوم',
              en: 'Hydrating mist — to refresh during the day',
            },
          },
          {
            emoji: '',
            text: { ar: 'قبعة ونظارة — حماية إضافية', en: 'Hat and sunglasses — extra protection' },
          },
          {
            emoji: '',
            text: {
              ar: 'جل الألوفيرا مبرد — بعد الشمس',
              en: 'Cooled aloe vera gel — after sun exposure',
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
