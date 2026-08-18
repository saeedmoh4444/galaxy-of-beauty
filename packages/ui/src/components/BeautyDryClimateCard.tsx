'use client';
import { cn } from '@galaxy/shared';
export function BeautyDryClimateCard({
  className = '',
  title = 'عناية في الجفاف',
  subtitle = 'بشرة مرطبة في المناخ الجاف',
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
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'مرطب كثيف — كريم غني وليس جل',
              en: 'Rich moisturizer — a heavy cream, not a gel',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'سيروم هيالورونيك — قبل المرطب',
              en: 'Hyaluronic serum — before moisturizer',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'مرطب جو في الغرفة — أثناء النوم',
              en: 'Humidifier in the room — while sleeping',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'سيراميد — يقوي حاجز البشرة',
              en: 'Ceramides — strengthen the skin barrier',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-amber-800 dark:text-amber-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
