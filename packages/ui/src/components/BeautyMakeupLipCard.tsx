'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupLipCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">💋</span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">مكياج الشفاه</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">لون يدوم طويلاً</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '🧴', text: '1. رطبي شفتيك — بلسم قبل المكياج' },
          { emoji: '✏️', text: '2. حددي الشفاه — بقلم بلون مطابق' },
          { emoji: '💄', text: '3. أحمر الشفاه — من المنتصف للأطراف' },
          { emoji: '🧻', text: '4. اضغطي بمنديل — لتثبيت اللون' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2 dark:bg-pink-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-200 text-[9px] font-bold text-pink-700 dark:bg-pink-800 dark:text-pink-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-pink-800 dark:text-pink-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
