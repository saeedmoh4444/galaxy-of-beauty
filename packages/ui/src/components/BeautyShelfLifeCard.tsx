'use client';
import { cn } from '@galaxy/shared';
export function BeautyShelfLifeCard({
  className = '',
  title = 'مدة صلاحية المنتجات',
  subtitle = 'متى تتخلصين من منتجاتك؟',
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
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'ماسكارا', en: 'Mascara' },
            tip: { ar: '3-6 أشهر — الأسرع تلوثاً', en: '3-6 months — fastest to contaminate' },
          },
          {
            emoji: '',
            label: { ar: 'كريمات', en: 'Creams' },
            tip: { ar: '6-12 شهر — بعد الفتح', en: '6-12 months — after opening' },
          },
          {
            emoji: '',
            label: { ar: 'بودرة', en: 'Powder' },
            tip: { ar: 'سنتان — الأطول عمراً', en: '2 years — the longest lasting' },
          },
          {
            emoji: '',
            label: { ar: 'طلاء أظافر', en: 'Nail polish' },
            tip: { ar: 'سنة — يسمك مع الوقت', en: '1 year — thickens over time' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
