'use client';
import { cn } from '@galaxy/shared';
export function BeautyCelluliteCard({
  className = '',
  title = 'السيلوليت',
  subtitle = 'علاج مظهر قشر البرتقال',
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
            emoji: '',
            text: {
              ar: 'مساج التصريف اللمفاوي — يقلل الاحتباس',
              en: 'Lymphatic drainage massage — reduces retention',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'رياضة منتظمة — تحسن الدورة الدموية',
              en: 'Regular exercise — improves circulation',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'اشربي ماء — الترطيب يحسن مظهر الجلد',
              en: 'Drink water — hydration improves skin texture',
            },
          },
          {
            emoji: '🫒',
            text: {
              ar: 'كافيين موضعي — كريمات تنشط الدورة',
              en: 'Topical caffeine — creams that boost circulation',
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
