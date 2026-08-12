'use client';
import { cn } from '@galaxy/shared';
export function BeautyPoreRefiningCard({ className = '' }: { className?: string }): JSX.Element {
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
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">تصغير المسام</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">
            لا يمكن إغلاقها — لكن يمكن تصغيرها
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'BHA — ينظف المسام من الداخل' },
          { emoji: '', text: 'نياسيناميد — ينظم إفراز الدهون' },
          { emoji: '', text: 'ماء بارد — يقلص المسام مؤقتاً' },
          { emoji: '', text: 'برايمر — يملأ المسام بصرياً' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-teal-800 dark:text-teal-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
