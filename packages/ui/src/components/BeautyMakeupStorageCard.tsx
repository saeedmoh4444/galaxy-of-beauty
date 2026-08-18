'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupStorageCard({
  className = '',
  heading = 'تخزين المكياج',
  subtitle = 'حافظي على منتجاتك نظيفة ومرتبة',
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
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{heading}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: 'مكان بارد وجاف — ليس في الحمام الرطب',
              en: 'Cool, dry place — not the humid bathroom',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'منظمات أكريليك شفافة — تري كل شيء',
              en: 'Clear acrylic organizers — see everything',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'بعيداً عن الشمس — الضوء يدمر المنتجات',
              en: 'Away from sunlight — light ruins products',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'قسميها: يومي — أسبوعي — مناسبات',
              en: 'Sort them: daily — weekly — occasions',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2 dark:bg-pink-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-pink-800 dark:text-pink-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
