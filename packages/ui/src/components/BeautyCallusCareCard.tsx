'use client';
import { cn } from '@galaxy/shared';
export function BeautyCallusCareCard({
  className = '',
  title = 'عناية بالكالو',
  subtitle = 'قدمان ناعمتان — بدون جلد خشن',
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
            emoji: '🪨',
            text: {
              ar: 'حجر الخفاف — بعد النقع مباشرة',
              en: 'Pumice stone — right after soaking',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كريم يوريا — يرطب ويزيل الجلد الميت',
              en: 'Urea cream — hydrates and removes dead skin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'جوارب قطنية — بعد الكريم طوال الليل',
              en: 'Cotton socks — over the cream overnight',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مرتين أسبوعياً — للصيف خصوصاً',
              en: 'Twice a week — especially in summer',
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
