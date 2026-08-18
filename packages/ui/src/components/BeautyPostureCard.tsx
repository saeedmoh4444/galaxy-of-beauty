'use client';

import { cn } from '@galaxy/shared';

interface BeautyPostureCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyPostureCard({
  className = '',
  title = 'قوام جميل',
  subtitle = 'الوقفة الصحيحة = ثقة وجمال',
  locale = 'ar',
}: BeautyPostureCardProps): JSX.Element {
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
            emoji: '️',
            label: { ar: 'ارفعي ذقنك', en: 'Lift your chin' },
            tip: { ar: 'موازية للأرض', en: 'Parallel to the ground' },
          },
          {
            emoji: '↩️',
            label: { ar: 'أكتاف للخلف', en: 'Shoulders back' },
            tip: { ar: 'تفتح الصدر', en: 'Opens the chest' },
          },
          {
            emoji: '',
            label: { ar: 'ظهر مستقيم', en: 'Straight back' },
            tip: { ar: 'لا تنحني للأمام', en: 'Do not lean forward' },
          },
          {
            emoji: '',
            label: { ar: 'وزن متوازن', en: 'Balanced weight' },
            tip: { ar: 'على القدمين بالتساوي', en: 'Evenly on both feet' },
          },
        ].map((t) => (
          <div key={t.label.ar} className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-950">
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
