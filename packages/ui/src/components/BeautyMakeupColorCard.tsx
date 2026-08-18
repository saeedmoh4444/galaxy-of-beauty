'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupColorCard({
  className = '',
  heading = 'نظرية الألوان',
  subtitle = 'اختاري ألوان مكياجك بذكاء',
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
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">{heading}</h4>
          <p className="text-[10px] text-violet-500 dark:text-violet-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'البشرة الدافئة: ألوان ذهبية، برونزية، خوخية',
              en: 'Warm skin: golds, bronzes, peaches',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'البشرة الباردة: وردي، بنفسجي، فضي',
              en: 'Cool skin: pinks, purples, silvers',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'البشرة الزيتونية: ألوان ترابية، زيتوني',
              en: 'Olive skin: earthy tones, olives',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'البشرة المحايدة: جميع الألوان تناسبك',
              en: 'Neutral skin: every color suits you',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-violet-800 dark:text-violet-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
