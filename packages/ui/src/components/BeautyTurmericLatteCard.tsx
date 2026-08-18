'use client';
import { cn } from '@galaxy/shared';
export function BeautyTurmericLatteCard({
  className = '',
  locale = 'ar',
  title = 'لاتيه الكركم',
  subtitle = 'الحليب الذهبي للبشرة',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'كركمين — أقوى مضاد التهاب طبيعي',
              en: 'Curcumin — a powerful natural anti-inflammatory',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يهدئ البشرة — ممتاز للحبوب والوردية',
              en: 'Calms the skin — great for breakouts and rosacea',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'حليب + كركم + فلفل أسود + عسل',
              en: 'Milk + turmeric + black pepper + honey',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'قبل النوم — يهدئ ويساعد على الاسترخاء',
              en: 'Before bed — soothing and relaxing',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-amber-800 dark:text-amber-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
