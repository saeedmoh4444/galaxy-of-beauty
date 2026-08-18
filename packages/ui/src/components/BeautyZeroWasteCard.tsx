'use client';
import { cn } from '@galaxy/shared';
export function BeautyZeroWasteCard({
  className = '',
  locale = 'ar',
  title = 'الجمال بدون نفايات',
  subtitle = 'جميلة — وكوكب أجمل',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
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
              ar: 'شامبو صلب — يدوم 3 شهور بدون بلاستيك',
              en: 'Solid shampoo — lasts 3 months, no plastic',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'فوط قماش — بدل القطن أحادي الاستخدام',
              en: 'Cloth pads — instead of single-use cotton',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'اشتري عبوات كبيرة — وأعيدي تعبئة الصغيرة',
              en: 'Buy large refills — and refill small containers',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'منتجات قابلة للتحلل — تغليف ورقي',
              en: 'Biodegradable products — paper packaging',
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
