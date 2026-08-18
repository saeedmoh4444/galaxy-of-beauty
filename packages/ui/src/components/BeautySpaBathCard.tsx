'use client';
import { cn } from '@galaxy/shared';
export function BeautySpaBathCard({
  className = '',
  locale = 'ar',
  title = 'حمام مغربي',
  subtitle = 'طقس الجمال التقليدي',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
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
              ar: 'الصابون البلدي — أساس الحمام المغربي',
              en: 'Beldy soap — the base of the Moroccan bath',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'الليفة المغربية — تقشير عميق للجسم',
              en: 'Moroccan kessa glove — deep body exfoliation',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'طين الغاسول — ينقي ويشد البشرة',
              en: 'Ghassoul clay — purifies and tightens the skin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ماء الورد — لإنعاش البعد عن الحمام',
              en: 'Rose water — to refresh after the bath',
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
