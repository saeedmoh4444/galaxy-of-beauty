'use client';

import { cn } from '@galaxy/shared';

interface BeautyGlowCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyGlowCard({
  className = '',
  title = 'أسرار الإشراقة',
  subtitle = 'بشرة متوهجة من الداخل',
  locale = 'ar',
}: BeautyGlowCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          {
            emoji: '',
            text: {
              ar: '8 أكواب ماء يومياً — أساس الإشراقة',
              en: '8 cups of water a day — the foundation of glow',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'خضروات وفواكه ملونة = فيتامينات',
              en: 'Colorful vegetables and fruits = vitamins',
            },
          },
          {
            emoji: '',
            text: {
              ar: '7-8 ساعات نوم — بشرة متجددة',
              en: '7-8 hours of sleep — regenerated skin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'حركة 30 دقيقة — دورة دموية أفضل',
              en: '30 minutes of movement — better blood circulation',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-rose-800 dark:text-rose-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
