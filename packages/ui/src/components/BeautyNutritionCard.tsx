'use client';

import { cn } from '@galaxy/shared';

interface BeautyNutritionCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyNutritionCard({
  className = '',
  title = 'تغذية الجمال',
  subtitle = 'طعامكِ هو جمالكِ',
  locale = 'ar',
}: BeautyNutritionCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'دهون صحية', en: 'Healthy fats' },
            tip: { ar: 'أفوكادو، مكسرات، زيت زيتون', en: 'Avocado, nuts, olive oil' },
          },
          {
            emoji: '',
            label: { ar: 'مضادات أكسدة', en: 'Antioxidants' },
            tip: { ar: 'توت، فراولة، رمان', en: 'Berries, strawberries, pomegranate' },
          },
          {
            emoji: '',
            label: { ar: 'خضروات ورقية', en: 'Leafy greens' },
            tip: { ar: 'سبانخ، كيل، جرجير', en: 'Spinach, kale, arugula' },
          },
          {
            emoji: '',
            label: { ar: 'أوميغا 3', en: 'Omega 3' },
            tip: { ar: 'سلمون، سردين، بذور كتان', en: 'Salmon, sardines, flaxseed' },
          },
        ].map((t) => (
          <div
            key={t.label.ar}
            className="rounded-lg bg-emerald-50 px-2.5 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
