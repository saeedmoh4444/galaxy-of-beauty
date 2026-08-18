'use client';
import { cn } from '@galaxy/shared';
export function BeautyPlasticFreeCard({
  className = '',
  title = 'الجمال بدون بلاستيك',
  subtitle = 'بدائل ذكية للبلاستيك',
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
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{title}</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '🪥',
            label: { ar: 'فرشاة بامبو', en: 'Bamboo brush' },
            tip: { ar: 'قابلة للتحلل — بدل البلاستيك', en: 'Biodegradable — instead of plastic' },
          },
          {
            emoji: '',
            label: { ar: 'زجاج وألمنيوم', en: 'Glass and aluminum' },
            tip: { ar: 'قابلة للتدوير للأبد', en: 'Recyclable forever' },
          },
          {
            emoji: '🪒',
            label: { ar: 'شفرة معدنية', en: 'Metal razor' },
            tip: { ar: 'تدوم سنوات — ليس للرمي', en: 'Lasts for years — not for throwing away' },
          },
          {
            emoji: '',
            label: { ar: 'صابون صلب', en: 'Solid soap' },
            tip: { ar: 'بدون تغليف — ورق فقط', en: 'No packaging — paper only' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-indigo-50 px-2.5 py-2 dark:bg-indigo-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-indigo-600 dark:text-indigo-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
