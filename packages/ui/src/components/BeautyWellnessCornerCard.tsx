'use client';

import { cn } from '@galaxy/shared';

interface BeautyWellnessCornerCardProps {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}

export function BeautyWellnessCornerCard({
  className = '',
  locale = 'ar',
  title = 'ركن العافية',
  subtitle = 'لحظات هدوء في يومكِ المزدحم',
}: BeautyWellnessCornerCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-teal-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl"></span>
        <h4 className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">{title}</h4>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{subtitle}</p>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          {
            emoji: '️',
            text: {
              ar: 'أشعلي شمعة واسترخي 5 دقائق',
              en: 'Light a candle and relax for 5 minutes',
            },
          },
          { emoji: '', text: { ar: 'استمعي لموسيقى هادئة', en: 'Listen to calming music' } },
          { emoji: '', text: { ar: 'اشربي شاي أعشاب دافئ', en: 'Sip a warm herbal tea' } },
          {
            emoji: '',
            text: { ar: 'اقرئي صفحة من كتابكِ المفضل', en: 'Read a page from your favorite book' },
          },
        ].map((t) => (
          <div
            key={t.text.ar}
            className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2.5 dark:bg-gray-800/60"
          >
            <span className="text-sm">{t.emoji}</span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
