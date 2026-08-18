'use client';
import { cn } from '@galaxy/shared';
export function BeautyDiamondFacialCard({
  className = '',
  title = 'فيشل الألماس',
  subtitle = 'سنفرة الألماس — بشرة جديدة',
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
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'رأس ماسي — يقشر الطبقة السطحية بلطف',
              en: 'Diamond tip — gently exfoliates the surface layer',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يحفز الكولاجين — بشرة أنعم وأكثر شباباً',
              en: 'Stimulates collagen — smoother, younger skin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يزيل الخلايا الميتة — يمتص السيروم أفضل',
              en: 'Removes dead cells — serum absorbs better',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كل 4-6 أسابيع — للنتائج المثالية',
              en: 'Every 4-6 weeks — for best results',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-indigo-800 dark:text-indigo-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
