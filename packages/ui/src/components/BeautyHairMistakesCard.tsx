'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairMistakesCard({
  className = '',
  title = 'أخطاء الشعر',
  subtitle = 'توقفي عنها — شعركِ سيشكركِ',
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
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">{title}</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'استخدام الحرارة بدون واقي — تلف دائم للشعر',
              en: 'Heat styling without a protectant — permanent hair damage',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'وضع البلسم على الجذور — يسد المسام ويثقل الشعر',
              en: 'Applying conditioner to the roots — clogs pores and weighs hair down',
            },
          },
          {
            emoji: '🪥',
            text: {
              ar: 'تمشيط الشعر المبلل بقوة — يتكسر بسهولة',
              en: 'Brushing wet hair aggressively — it breaks easily',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'النوم بشعر مبلل — فطريات وتقصف',
              en: 'Sleeping with wet hair — fungus and split ends',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-orange-800 dark:text-orange-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
