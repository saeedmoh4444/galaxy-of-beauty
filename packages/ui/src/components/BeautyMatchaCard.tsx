'use client';
import { cn } from '@galaxy/shared';
export function BeautyMatchaCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-green-100 bg-white p-4 dark:border-green-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🍵</span>
        <div>
          <h4 className="text-sm font-bold text-green-700 dark:text-green-300">الماتشا</h4>
          <p className="text-[10px] text-green-500 dark:text-green-400">
            أقوى من الشاي الأخضر بـ 10 مرات
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '💪', text: 'مركز 10x — مضادات أكسدة أكثر من الشاي العادي' },
          { emoji: '✨', text: 'كلوروفيل — ينقي البشرة من الداخل' },
          { emoji: '🧠', text: 'L-Theanine — استرخاء بدون نعاس' },
          { emoji: '🥛', text: 'مع الحليب — لاتيه ماتشا لذيذ' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-green-800 dark:text-green-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
