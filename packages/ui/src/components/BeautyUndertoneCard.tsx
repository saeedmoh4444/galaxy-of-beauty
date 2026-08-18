'use client';
import { cn } from '@galaxy/shared';
export function BeautyUndertoneCard({
  className = '',
  locale = 'ar',
  title = 'الأندرتون',
  subtitle = 'اعرفي أندرتونكِ — لإطلالة متناسقة',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'دافئ', en: 'Warm' },
            tip: { ar: 'عروق خضراء — الذهب يناسبك', en: 'Green veins — gold suits you' },
          },
          {
            emoji: '🩷',
            label: { ar: 'بارد', en: 'Cool' },
            tip: { ar: 'عروق زرقاء — الفضة تناسبك', en: 'Blue veins — silver suits you' },
          },
          {
            emoji: '',
            label: { ar: 'محايد', en: 'Neutral' },
            tip: { ar: 'مزيج — الذهب والفضة', en: 'A mix — gold and silver' },
          },
          {
            emoji: '🩶',
            label: { ar: 'اختبار', en: 'Test' },
            tip: { ar: 'ورقة بيضاء — قارني لون بشرتك', en: 'White paper — compare your skin tone' },
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
