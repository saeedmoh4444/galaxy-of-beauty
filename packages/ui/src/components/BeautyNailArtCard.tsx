'use client';
import { cn } from '@galaxy/shared';
export function BeautyNailArtCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">فن الأظافر</h4>
          <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">أفكار وأساليب</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '', label: 'فرنسي', tip: 'كلاسيك — طرف أبيض' },
          { emoji: '', label: 'جليتر', tip: 'لامع — للمناسبات' },
          { emoji: '', label: 'Ombre', tip: 'تدرج لونين' },
          { emoji: '', label: 'طبيعي', tip: 'Nude — لكل يوم' },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-fuchsia-50 px-2.5 py-2 dark:bg-fuchsia-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-fuchsia-800 dark:text-fuchsia-200">
              {t.label}
            </p>
            <p className="text-[9px] text-fuchsia-600 dark:text-fuchsia-400">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
