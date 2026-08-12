'use client';
import { cn } from '@galaxy/shared';
export function BeautySunscreenCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-yellow-100 bg-white p-4 dark:border-yellow-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
            دليل واقي الشمس
          </h4>
          <p className="text-[10px] text-yellow-500 dark:text-yellow-400">كل ما تحتاجين معرفته</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'SPF 30 كحد أدنى — SPF 50 أفضل' },
          { emoji: '', text: 'جددي كل ساعتين — خاصة في الصيف' },
          { emoji: '', text: 'كمية كافية — ملعقة شاي للوجه' },
          { emoji: '️', text: 'حتى في الغيوم — الأشعة تخترق' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 dark:bg-yellow-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-yellow-800 dark:text-yellow-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
