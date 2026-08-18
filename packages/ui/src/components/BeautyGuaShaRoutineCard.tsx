'use client';
import { cn } from '@galaxy/shared';
export function BeautyGuaShaRoutineCard({
  className = '',
  title = 'روتين القواشا',
  subtitle = 'تدليك يومي — 5 دقائق فقط',
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
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: '1. زيت أو سيروم — لتزلق الأداة على البشرة',
              en: '1. Oil or serum — so the tool glides over the skin',
            },
          },
          {
            emoji: '️',
            text: {
              ar: '2. دائماً للأعلى وللخارج — ضد الجاذبية',
              en: '2. Always upward and outward — against gravity',
            },
          },
          {
            emoji: '',
            text: {
              ar: '3. 5 تمريرات لكل منطقة — بلطف وليس بقوة',
              en: '3. 5 passes per area — gently, not forcefully',
            },
          },
          {
            emoji: '️',
            text: {
              ar: '4. خزني الحجر في الثلاجة — لانتعاش إضافي',
              en: '4. Keep the stone in the fridge — for extra refreshment',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-200 text-[9px] font-bold text-teal-700 dark:bg-teal-800 dark:text-teal-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-teal-800 dark:text-teal-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
