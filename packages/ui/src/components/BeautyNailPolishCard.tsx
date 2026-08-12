'use client';
import { cn } from '@galaxy/shared';
export function BeautyNailPolishCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">طلاء الأظافر</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">لتطبيق مثالي</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '️', text: '1. Base coat — يحمي الظفر من التصبغ' },
          { emoji: '', text: '2. طبقتان رقيقتان — أفضل من طبقة سميكة' },
          { emoji: '', text: '3. Top coat — لمعان وحماية' },
          { emoji: '', text: '4. انتظري 2-3 دقائق بين الطبقات' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-200 text-[9px] font-bold text-purple-700 dark:bg-purple-800 dark:text-purple-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
