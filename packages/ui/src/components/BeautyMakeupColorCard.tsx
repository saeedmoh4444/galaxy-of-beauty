'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupColorCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🎨</span>
        <div>
          <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">نظرية الألوان</h4>
          <p className="text-[10px] text-violet-500 dark:text-violet-400">
            اختاري ألوان مكياجك بذكاء
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '🟠', text: 'البشرة الدافئة: ألوان ذهبية، برونزية، خوخية' },
          { emoji: '🔵', text: 'البشرة الباردة: وردي، بنفسجي، فضي' },
          { emoji: '🟢', text: 'البشرة الزيتونية: ألوان ترابية، زيتوني' },
          { emoji: '⚪', text: 'البشرة المحايدة: جميع الألوان تناسبك' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-violet-800 dark:text-violet-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
