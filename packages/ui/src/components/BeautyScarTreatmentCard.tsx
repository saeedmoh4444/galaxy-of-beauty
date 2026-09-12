'use client';
import { cn } from '@galaxy/shared';
export function BeautyScarTreatmentCard({
  className = '',
  title = 'علاجات الندبات',
  subtitle = 'من الكريمات إلى الإجراءات',
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
        'rounded-2xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{title}</h4>
          <p className="text-[10px] text-brand-500 dark:text-brand-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '🧴',
            text: {
              ar: 'سيليكون جل — أفضل علاج موضعي للندبات',
              en: 'Silicone gel — the best topical scar treatment',
            },
          },
          {
            emoji: '💉',
            text: {
              ar: 'مايكرونيدلنغ — يحفز كولاجين جديد',
              en: 'Microneedling — stimulates new collagen',
            },
          },
          {
            emoji: '⚡',
            text: {
              ar: 'ليزر فراكشنال — يعيد سطح البشرة',
              en: 'Fractional laser — resurfaces the skin',
            },
          },
          {
            emoji: '⏰',
            text: {
              ar: 'العلاج المبكر — أفضل من الندبات القديمة',
              en: 'Early treatment — better than old scars',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-brand-800 dark:text-brand-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
