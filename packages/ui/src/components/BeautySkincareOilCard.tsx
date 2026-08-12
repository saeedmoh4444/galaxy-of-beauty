'use client';
import { cn } from '@galaxy/shared';
export function BeautySkincareOilCard({ className = '' }: { className?: string }): JSX.Element {
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
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">زيوت الوجه</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">متى وكيف تستخدمينها</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'آخر خطوة في المساء — تغلق الترطيب' },
          { emoji: '', text: '2-3 قطرات فقط — بين راحة اليد' },
          { emoji: '🫒', text: 'ثمر الورد — للتصبغات والتجاعيد' },
          { emoji: '', text: 'جوجوبا — الأقرب لزيوت البشرة' },
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
