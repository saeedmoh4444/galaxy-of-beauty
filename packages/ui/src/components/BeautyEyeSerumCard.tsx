'use client';
import { cn } from '@galaxy/shared';
export function BeautyEyeSerumCard({ className = '' }: { className?: string }): JSX.Element {
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
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">سيروم العين</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">
            دليل اختيار السيروم المناسب
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '', label: 'كافيين', tip: 'للهالات والانتفاخ' },
          { emoji: '', label: 'ببتيدات', tip: 'للتجاعيد والخطوط' },
          { emoji: '', label: 'هيالورونيك', tip: 'للترطيب العميق' },
          { emoji: '', label: 'فيتامين C', tip: 'لتفتيح الهالات' },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-rose-50 px-2.5 py-2 dark:bg-rose-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-200">
              {t.label}
            </p>
            <p className="text-[9px] text-rose-600 dark:text-rose-400">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
