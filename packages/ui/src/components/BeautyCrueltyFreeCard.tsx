'use client';
import { cn } from '@galaxy/shared';
export function BeautyCrueltyFreeCard({ className = '' }: { className?: string }): JSX.Element {
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
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">
            بدون تجارب على الحيوانات
          </h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">جمال أخلاقي — بدون قسوة</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'شعار Leaping Bunny — المعيار الذهبي' },
          { emoji: '', text: 'PETA Certified — علامة أخرى موثوقة' },
          { emoji: '', text: 'السعودية تمنع التجارب على الحيوانات للتجميل' },
          { emoji: '', text: 'ابحثي عن الشعار — ليس كل ما يقول "طبيعي" خالٍ' },
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
