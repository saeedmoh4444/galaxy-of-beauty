'use client';
import { cn } from '@galaxy/shared';
export function BeautyBridalEmergencyCard({
  className = '',
  title = 'طوارئ العروس',
  subtitle = 'طقم إنقاذ يوم الزفاف',
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
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🆘</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'حبة حساسية', en: 'Allergy pill' },
            tip: { ar: 'لأي تحسس مفاجئ', en: 'For any sudden reaction' },
          },
          {
            emoji: '🩹',
            label: { ar: 'لصقات', en: 'Blister bandages' },
            tip: { ar: 'للكعب من الحذاء', en: 'For heels from shoes' },
          },
          {
            emoji: '',
            label: { ar: 'ورق نشاف', en: 'Oil blotting paper' },
            tip: { ar: 'لإزالة اللمعان', en: 'To remove shine' },
          },
          {
            emoji: '',
            label: { ar: 'أحمر شفاه', en: 'Lipstick' },
            tip: { ar: 'للمسات سريعة', en: 'For quick touch-ups' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-950">
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
