'use client';
import { cn } from '@galaxy/shared';
export function BeautyRednessReliefCard({
  className = '',
  title = 'تهدئة الاحمرار',
  subtitle = 'بشرة هادئة في دقائق',
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
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'ماء بارد — يغسل الوجه ويقلص الأوعية',
              en: 'Cold water — cleanses and constricts vessels',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'جل الألوفيرا — مهدئ طبيعي فوري',
              en: 'Aloe vera gel — an instant natural soother',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'أوقفي كل المنتجات النشطة — يوم راحة',
              en: 'Stop all active products — a rest day',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مرطب بسيط — بدون عطور أو أحماض',
              en: 'A simple moisturizer — no fragrance or acids',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
