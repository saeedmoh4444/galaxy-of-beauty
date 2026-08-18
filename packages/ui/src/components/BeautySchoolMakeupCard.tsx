'use client';
import { cn } from '@galaxy/shared';
export function BeautySchoolMakeupCard({
  className = '',
  title = 'مكياج المدرسة',
  subtitle = 'إطلالة طبيعية ليوم دراسي',
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
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: 'واقي شمس ملون — حماية + لون خفيف',
              en: 'Tinted sunscreen — protection + a hint of color',
            },
          },
          {
            emoji: '️',
            text: { ar: 'ماسكارا بنية — أنعم من السوداء', en: 'Brown mascara — softer than black' },
          },
          {
            emoji: '',
            text: {
              ar: 'تينت شفاه — لون طبيعي يدوم',
              en: 'Lip tint — a natural, long-lasting color',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مرطب فقط — البشرة تحتاج التنفس',
              en: 'Moisturizer only — skin needs to breathe',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
