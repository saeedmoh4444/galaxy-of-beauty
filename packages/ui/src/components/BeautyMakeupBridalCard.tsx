'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupBridalCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">👰</span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">مكياج العروس</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">تحضير مكياج الزفاف</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '📅', text: 'تجربة المكياج قبل الزفاف بـ 3-4 أسابيع' },
          { emoji: '📸', text: 'صوري المكياج التجريبي — لتري كيف يبدو' },
          { emoji: '💧', text: 'اهتمي ببشرتك قبل الزفاف بـ 6 أشهر' },
          { emoji: '🎨', text: 'مكياج يدوم — تقنية HD أو airbrush' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-rose-800 dark:text-rose-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
