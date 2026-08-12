'use client';
import { cn } from '@galaxy/shared';
export function BeautyBrowShapeCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">✨</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">شكل الحواجب</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">
            الحاجب المناسب لشكل وجهكِ
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '🥚', label: 'بيضاوي', tip: 'حواجب طبيعية — قوس ناعم' },
          { emoji: '🟤', label: 'دائري', tip: 'قوس مرتفع — يطيل الوجه' },
          { emoji: '⬜', label: 'مربع', tip: 'زوايا حادة — توازن الفك' },
          { emoji: '❤️', label: 'قلب', tip: 'حواجب مقوسة — تلطف الجبهة' },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950">
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
