'use client';
import { cn } from '@galaxy/shared';
export function BeautyPerimenopauseCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🌡️</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">حول انقطاع الطمث</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">جمالكِ في مرحلة التغيير</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '💧', text: 'جفاف البشرة — انتقلي لكريمات أغنى' },
          { emoji: '🔴', text: 'احمرار وهبات ساخنة — منتجات مهدئة' },
          { emoji: '🛡️', text: 'الكولاجين يقل — ببتيدات وسيراميد' },
          { emoji: '🧴', text: 'SPF ضروري — التصبغات تزيد' },
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
