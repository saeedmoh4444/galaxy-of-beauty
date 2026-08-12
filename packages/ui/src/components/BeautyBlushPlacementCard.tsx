'use client';
import { cn } from '@galaxy/shared';
export function BeautyBlushPlacementCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">موضع البلاشر</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">ارفعي — لا تنزلي</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'بيضاوي: على تفاحة الخد — للأعلى نحو الصدغ' },
          { emoji: '', text: 'دائري: أعلى الخد — بزاوية حادة للأعلى' },
          { emoji: '⬜', text: 'مربع: مركز الخد — دائري لتليين الزوايا' },
          { emoji: '️', text: 'قلب: منخفض — تحت تفاحة الخد' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2 dark:bg-pink-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-pink-800 dark:text-pink-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
