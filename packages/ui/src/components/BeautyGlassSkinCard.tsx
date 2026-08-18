'use client';
import { cn } from '@galaxy/shared';
export function BeautyGlassSkinCard({
  className = '',
  title = 'البشرة الزجاجية',
  subtitle = 'سر البشرة الكورية الصافية',
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
            emoji: '',
            text: {
              ar: '7 طبقات ترطيب — تونر خفيف يطبق 7 مرات',
              en: '7 layers of hydration — a light toner applied 7 times',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'طبقات رقيقة — كل طبقة تمتص قبل التالية',
              en: 'Thin layers — each one absorbs before the next',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تقشير منتظم — أساس البشرة الزجاجية',
              en: 'Regular exfoliation — the foundation of glass skin',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'واقي شمس يومي — حماية من التصبغات',
              en: 'Daily sunscreen — protection against pigmentation',
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
