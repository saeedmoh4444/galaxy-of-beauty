'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairColorCard({
  className = '',
  title = 'صبغ الشعر',
  subtitle = 'نصائح قبل وبعد الصبغة',
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
        'rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">{title}</h4>
          <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'اختبار الحساسية', en: 'Patch test' },
            tip: { ar: 'قبل 48 ساعة من الصبغة', en: '48 hours before coloring' },
          },
          {
            emoji: '',
            label: { ar: 'لا تغسلي', en: 'Skip the wash' },
            tip: {
              ar: 'لا تغسلي شعرك قبل الصبغة بيوم',
              en: 'Do not wash your hair the day before coloring',
            },
          },
          {
            emoji: '',
            label: { ar: 'شامبو بنفسجي', en: 'Purple shampoo' },
            tip: {
              ar: 'للشعر الأشقر — يمنع الاصفرار',
              en: 'For blonde hair — prevents brassiness',
            },
          },
          {
            emoji: '',
            label: { ar: 'بلسم عميق', en: 'Deep conditioner' },
            tip: { ar: 'بعد الصبغة — لتثبيت اللون', en: 'After coloring — to lock in the color' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-fuchsia-50 px-2.5 py-2 dark:bg-fuchsia-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-fuchsia-800 dark:text-fuchsia-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-fuchsia-600 dark:text-fuchsia-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
