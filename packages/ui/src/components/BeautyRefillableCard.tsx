'use client';
import { cn } from '@galaxy/shared';
export function BeautyRefillableCard({
  className = '',
  title = 'عبوات قابلة للتعبئة',
  subtitle = 'اشتري مرة — استخدمي للأبد',
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
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'أوفر — العبوة الأصلية مرة واحدة فقط',
              en: 'More affordable — buy the original container only once',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تقلل النفايات — 70% أقل من البلاستيك',
              en: 'Reduces waste — 70% less plastic',
            },
          },
          {
            emoji: '',
            text: { ar: 'أحمر شفاه — كريم أساس — عطور', en: 'Lipstick — foundation — fragrances' },
          },
          {
            emoji: '️',
            text: {
              ar: 'ارجعي العبوة الفارغة — لخصم على القادمة',
              en: 'Return the empty container — for a discount on the next',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-teal-800 dark:text-teal-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
