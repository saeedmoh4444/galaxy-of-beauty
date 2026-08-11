'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupMascaraCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🖤</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">الماسكارا</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">رموش طويلة وكثيفة</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '〰️', text: 'حركي العصا بشكل متعرج — من الجذور للأطراف' },
          { emoji: '📅', text: 'جددِي الماسكارا كل 3 أشهر' },
          { emoji: '🚫', text: 'لا تضخي الهواء في الأنبوب — يجففها' },
          { emoji: '💧', text: 'ماسكارا مقاومة للماء = مزيل زيتي' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
