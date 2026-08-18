'use client';
import { cn } from '@galaxy/shared';
interface BeautyTonerCardProps {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}
export function BeautyTonerCard({
  className = '',
  locale = 'ar',
  title = 'دليل التونر',
  subtitle = 'لماذا ومتى وكيف',
}: BeautyTonerCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{title}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'لماذا', en: 'Why' },
            tip: { ar: 'يعيد توازن pH البشرة', en: "Restores the skin's pH balance" },
          },
          {
            emoji: '',
            label: { ar: 'متى', en: 'When' },
            tip: { ar: 'بعد الغسول مباشرة', en: 'Right after cleansing' },
          },
          {
            emoji: '',
            label: { ar: 'كيف', en: 'How' },
            tip: { ar: 'بقطنة أو براحة اليد', en: 'With a cotton pad or hands' },
          },
          {
            emoji: '',
            label: { ar: 'أي نوع', en: 'Which type' },
            tip: { ar: 'حسب نوع بشرتكِ', en: 'Depends on your skin type' },
          },
        ].map((t) => (
          <div key={t.label.ar} className="rounded-lg bg-sky-50 px-2.5 py-2 dark:bg-sky-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-sky-800 dark:text-sky-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-sky-600 dark:text-sky-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
