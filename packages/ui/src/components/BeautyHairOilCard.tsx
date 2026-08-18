'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairOilCard({
  className = '',
  title = 'زيوت الشعر',
  subtitle = 'أي زيت لشعرك؟',
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
        <span className="text-xl">🫒</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'جوز الهند', en: 'Coconut' },
            tip: {
              ar: 'يخترق الشعرة — ترطيب عميق',
              en: 'Penetrates the hair shaft — deep hydration',
            },
          },
          {
            emoji: '🫒',
            label: { ar: 'الأرغان', en: 'Argan' },
            tip: { ar: 'ذهبي — للمعان وتغذية', en: 'Golden — for shine and nourishment' },
          },
          {
            emoji: '',
            label: { ar: 'إكليل الجبل', en: 'Rosemary' },
            tip: { ar: 'يحفز نمو الشعر', en: 'Stimulates hair growth' },
          },
          {
            emoji: '',
            label: { ar: 'الجوجوبا', en: 'Jojoba' },
            tip: { ar: 'يشبه زيوت فروة الرأس', en: 'Similar to the scalp’s natural oils' },
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
