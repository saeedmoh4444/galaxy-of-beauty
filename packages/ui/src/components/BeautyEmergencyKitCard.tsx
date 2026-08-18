'use client';
import { cn } from '@galaxy/shared';
export function BeautyEmergencyKitCard({
  className = '',
  title = 'حقيبة طوارئ الجمال',
  subtitle = 'أساسيات في شنطتكِ',
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
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'أحمر شفاه', en: 'Lipstick' },
            tip: { ar: 'لون محايد — يناسب كل شيء', en: 'Neutral shade — suits everything' },
          },
          {
            emoji: '',
            label: { ar: 'ورق نشاف', en: 'Blotting paper' },
            tip: { ar: 'يزيل اللمعان بدون مكياج', en: 'Removes shine without makeup' },
          },
          {
            emoji: '🪞',
            label: { ar: 'مرآة صغيرة', en: 'Small mirror' },
            tip: { ar: 'للمسات السريعة', en: 'For quick touch-ups' },
          },
          {
            emoji: '',
            label: { ar: 'لصقة حبوب', en: 'Spot patch' },
            tip: { ar: 'للطوارئ — غير مرئية', en: 'For emergencies — invisible' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-rose-50 px-2.5 py-2 dark:bg-rose-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-rose-600 dark:text-rose-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
