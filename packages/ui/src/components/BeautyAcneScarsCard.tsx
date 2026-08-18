'use client';
import { cn } from '@galaxy/shared';
export function BeautyAcneScarsCard({
  className = '',
  title = 'ندبات الحبوب',
  subtitle = 'أنواع الندبات وعلاج كل نوع',
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
        'rounded-2xl border border-red-100 bg-white p-4 dark:border-red-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🩹</span>
        <div>
          <h4 className="text-sm font-bold text-red-700 dark:text-red-300">{title}</h4>
          <p className="text-[10px] text-red-500 dark:text-red-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '️',
            label: { ar: 'حفر', en: 'Pitted' },
            tip: {
              ar: 'ندبات عميقة — تحتاج ليزر أو فيلر',
              en: 'Deep scars — need laser or filler',
            },
          },
          {
            emoji: '',
            label: { ar: 'حمراء', en: 'Red' },
            tip: { ar: 'حديثة — تختفي مع الوقت', en: 'Recent — fade with time' },
          },
          {
            emoji: '',
            label: { ar: 'بنية', en: 'Brown' },
            tip: {
              ar: 'تصبغات — تقشير وفيتامين C',
              en: 'Pigmentation — exfoliation and vitamin C',
            },
          },
          {
            emoji: '',
            label: { ar: 'بارزة', en: 'Raised' },
            tip: {
              ar: 'ندبات متضخمة — كورتيزون موضعي',
              en: 'Hypertrophic scars — topical cortisone',
            },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-red-50 px-2.5 py-2 dark:bg-red-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-red-800 dark:text-red-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-red-600 dark:text-red-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
