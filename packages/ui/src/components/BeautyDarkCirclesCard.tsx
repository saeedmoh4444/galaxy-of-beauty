'use client';
import { cn } from '@galaxy/shared';
export function BeautyDarkCirclesCard({
  className = '',
  title = 'الهالات السوداء',
  subtitle = 'أسبابها وعلاجها من جذورها',
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
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'قلة النوم', en: 'Lack of sleep' },
            tip: {
              ar: 'السبب الأول — نامي 7-8 ساعات',
              en: 'The number one cause — sleep 7-8 hours',
            },
          },
          {
            emoji: '🩸',
            label: { ar: 'نقص الحديد', en: 'Iron deficiency' },
            tip: { ar: 'سبب شائع — فحص دم', en: 'A common cause — get a blood test' },
          },
          {
            emoji: '',
            label: { ar: 'وراثة', en: 'Genetics' },
            tip: { ar: 'ميل طبيعي — كريمات خاصة', en: 'Natural tendency — special creams' },
          },
          {
            emoji: '',
            label: { ar: 'جفاف', en: 'Dryness' },
            tip: { ar: 'البشرة الرقيقة تحت العين', en: 'Thin skin under the eye' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-purple-600 dark:text-purple-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
