'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairGlossCard({
  className = '',
  title = 'غلوس الشعر',
  subtitle = 'لمعان فوري — بدون أمونيا',
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
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'لمعان زجاجي — يعكس الضوء بشكل جميل',
              en: 'Glassy shine — reflects light beautifully',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'شفاف أو ملون — ينعش لون شعركِ',
              en: 'Clear or tinted — refreshes your hair color',
            },
          },
          {
            emoji: '️',
            text: {
              ar: '20 دقيقة — في الصالون أو في البيت',
              en: '20 minutes — at the salon or at home',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كل 4-6 أسابيع — للحفاظ على اللمعان',
              en: 'Every 4-6 weeks — to maintain the shine',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
