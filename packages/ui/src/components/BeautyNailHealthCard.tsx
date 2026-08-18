'use client';
import { cn } from '@galaxy/shared';
export function BeautyNailHealthCard({
  className = '',
  title = 'صحة الأظافر',
  subtitle = 'علامات تحذيرية',
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
        <span className="text-xl">🩺</span>
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
              ar: 'بقع بيضاء — نقص زنك أو إصابة',
              en: 'White spots — zinc deficiency or injury',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'اصفرار — فطريات أو طلاء بدون base coat',
              en: 'Yellowing — fungus or polish without a base coat',
            },
          },
          {
            emoji: '〰️',
            text: { ar: 'خطوط أفقية — إجهاد أو مرض', en: 'Horizontal ridges — stress or illness' },
          },
          {
            emoji: '🩺',
            text: { ar: 'تغيرات مستمرة — راجعي الطبيب', en: 'Persistent changes — see a doctor' },
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
