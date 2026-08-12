'use client';

import { cn } from '@galaxy/shared';

interface BeautyJewelryCardProps {
  className?: string;
}

export function BeautyJewelryCard({ className = '' }: BeautyJewelryCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">
            تنسيق الإكسسوارات
          </h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">اللمسة الأخيرة لإطلالتك</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '', label: 'أقراط', tip: 'طويلة = وجه أنحف' },
          { emoji: '', label: 'عقد', tip: 'يناسب الفتحة' },
          { emoji: '', label: 'ساعة', tip: 'كلاسيك = لكل مناسبة' },
          { emoji: '', label: 'خواتم', tip: '2-3 كحد أقصى' },
        ].map((t) => (
          <div key={t.label} className="rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
              {t.label}
            </p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
