'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairMaskCard({
  className = '',
  title = 'ماسك الشعر',
  subtitle = 'وصفات طبيعية للشعر',
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
        <span className="text-xl">‍️</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'أفوكادو + عسل', en: 'Avocado + honey' },
            tip: { ar: 'للشعر الجاف — ترطيب عميق', en: 'For dry hair — deep hydration' },
          },
          {
            emoji: '',
            label: { ar: 'بيض + زيت زيتون', en: 'Egg + olive oil' },
            tip: { ar: 'للشعر الضعيف — بروتين', en: 'For weak hair — protein' },
          },
          {
            emoji: '',
            label: { ar: 'موز + زبادي', en: 'Banana + yogurt' },
            tip: { ar: 'للشعر التالف — ترميم', en: 'For damaged hair — repair' },
          },
          {
            emoji: '',
            label: { ar: 'خل تفاح', en: 'Apple cider vinegar' },
            tip: { ar: 'لمعان وتنظيف فروة الرأس', en: 'Shine and scalp cleansing' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-purple-600 dark:text-purple-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
