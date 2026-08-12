'use client';
import { cn } from '@galaxy/shared';
export function BeautyBridalBodyCareCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🧖</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">جسم العروس</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">عناية شاملة قبل الزفاف</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '🧤', text: 'تقشير الجسم — مرة أسبوعياً قبل الزفاف' },
          { emoji: '💆', text: 'مساج استرخاء — يخفف توتر التحضيرات' },
          { emoji: '🕯️', text: 'إزالة الشعر — قبل الزفاف بـ 3-5 أيام' },
          { emoji: '✨', text: 'تان لطيف — قبل الزفاف بيومين' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-amber-800 dark:text-amber-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
