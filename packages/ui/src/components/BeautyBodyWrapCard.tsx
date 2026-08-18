'use client';
import { cn } from '@galaxy/shared';
export function BeautyBodyWrapCard({
  className = '',
  title = 'لفافات الجسم',
  subtitle = 'علاجات سبا للجسم',
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
            label: { ar: 'طين البحر', en: 'Sea mud' },
            tip: { ar: 'ينظف ويزيل السموم', en: 'Cleanses and detoxifies' },
          },
          {
            emoji: '',
            label: { ar: 'شوكولاتة', en: 'Chocolate' },
            tip: { ar: 'مضاد أكسدة — يرطب وينعم', en: 'Antioxidant — moisturizes and softens' },
          },
          {
            emoji: '',
            label: { ar: 'أعشاب بحرية', en: 'Seaweed' },
            tip: { ar: 'يغذي وينشط البشرة', en: 'Nourishes and energizes the skin' },
          },
          {
            emoji: '',
            label: { ar: 'قهوة', en: 'Coffee' },
            tip: { ar: 'كافيين — يشد وينشط', en: 'Caffeine — firms and energizes' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-emerald-50 px-2.5 py-2 dark:bg-emerald-950">
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
