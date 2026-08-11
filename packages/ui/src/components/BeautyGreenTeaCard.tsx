'use client';
import { cn } from '@galaxy/shared';
export function BeautyGreenTeaCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🍵</span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">الشاي الأخضر</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">مشروب الجمال اليومي</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '🛡️', text: 'مضاد أكسدة قوي — يحمي البشرة من التلف' },
          { emoji: '🧯', text: 'يقلل الالتهابات — ممتاز للحبوب والاحمرار' },
          { emoji: '☕', text: '2-3 أكواب يومياً — بدون سكر' },
          { emoji: '🧊', text: 'مثلج أو ساخن — أكياس الشاي للعيون المنتفخة' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
