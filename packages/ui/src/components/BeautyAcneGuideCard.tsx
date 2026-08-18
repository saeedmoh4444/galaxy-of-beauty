'use client';
import { cn } from '@galaxy/shared';
export function BeautyAcneGuideCard({
  className = '',
  title = 'دليل الحبوب',
  subtitle = 'افهمي نوع الحبوب لتعالجيها',
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
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'رؤوس بيضاء', en: 'Whiteheads' },
            tip: { ar: 'مسام مسدودة — تقشير لطيف', en: 'Clogged pores — gentle exfoliation' },
          },
          {
            emoji: '',
            label: { ar: 'رؤوس سوداء', en: 'Blackheads' },
            tip: { ar: 'حمض الساليسيليك', en: 'Salicylic acid' },
          },
          {
            emoji: '',
            label: { ar: 'ملتهبة', en: 'Inflamed' },
            tip: { ar: 'بينزويل بيروكسايد', en: 'Benzoyl peroxide' },
          },
          {
            emoji: '🩺',
            label: { ar: 'شديدة', en: 'Severe' },
            tip: { ar: 'راجعي طبيب جلدية', en: 'See a dermatologist' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-teal-50 px-2.5 py-2 dark:bg-teal-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-teal-600 dark:text-teal-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
