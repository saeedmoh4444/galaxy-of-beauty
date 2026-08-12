'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupBaseCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🎨</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">أساس المكياج</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400"> primer + foundation</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '🧴', text: '1. برايمر — يملأ المسام ويثبت المكياج' },
          { emoji: '💧', text: '2. بشرة رطبة — المرطب قبل البرايمر' },
          { emoji: '🎨', text: '3. فاونديشن — طبقة رقيقة' },
          { emoji: '🖌️', text: '4. ادمجي بالإسفنجة — وليس الأصابع' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[9px] font-bold text-amber-700 dark:bg-amber-800 dark:text-amber-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-amber-800 dark:text-amber-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
