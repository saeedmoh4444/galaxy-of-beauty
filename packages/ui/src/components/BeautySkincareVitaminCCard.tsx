'use client';
import { cn } from '@galaxy/shared';
export function BeautySkincareVitaminCCard({
  className = '',
}: {
  className?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">فيتامين سي</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">مضاد الأكسدة الأقوى</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '️', text: 'صباحاً — قبل واقي الشمس' },
          { emoji: '', text: 'يفتح التصبغات ويوحد اللون' },
          { emoji: '️', text: 'يعزز حماية واقي الشمس' },
          { emoji: '', text: 'L-Ascorbic Acid — أقوى صيغة' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-orange-800 dark:text-orange-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
