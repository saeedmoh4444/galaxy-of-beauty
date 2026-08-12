'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupSettingCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">
            تثبيت المكياج
          </h4>
          <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">
            لمكياج يدوم طوال اليوم
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'سبراي التثبيت — آخر خطوة' },
          { emoji: '', text: 'برايمر — أساس التثبيت' },
          { emoji: '', text: 'بودرة شفافة — للمنطقة الدهنية فقط' },
          { emoji: '', text: 'ورق نشاف — بدل إضافة بودرة' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-fuchsia-50 px-3 py-2 dark:bg-fuchsia-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-fuchsia-800 dark:text-fuchsia-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
