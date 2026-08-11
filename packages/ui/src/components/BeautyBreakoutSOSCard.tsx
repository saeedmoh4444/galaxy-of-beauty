'use client';
import { cn } from '@galaxy/shared';
export function BeautyBreakoutSOSCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-red-100 bg-white p-4 dark:border-red-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🚨</span>
        <div>
          <h4 className="text-sm font-bold text-red-700 dark:text-red-300">طوارئ الحبوب</h4>
          <p className="text-[10px] text-red-500 dark:text-red-400">ظهور مفاجئ — حل سريع</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '🧊', text: 'كمادة ثلج — 5 دقائق لتقليل الالتهاب' },
          { emoji: '💊', text: 'لصقة حبوب — تجفف وتحمي من العبث' },
          { emoji: '🚫', text: 'لا تضغطي — يزيد الالتهاب ويترك أثراً' },
          { emoji: '🧴', text: 'كريم بنزويل بيروكسايد — للطوارئ فقط' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-red-800 dark:text-red-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
