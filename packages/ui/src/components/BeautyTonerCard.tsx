'use client';
import { cn } from '@galaxy/shared';
interface BeautyTonerCardProps {
  className?: string;
}
export function BeautyTonerCard({ className = '' }: BeautyTonerCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">دليل التونر</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">لماذا ومتى وكيف</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '', label: 'لماذا', tip: 'يعيد توازن pH البشرة' },
          { emoji: '', label: 'متى', tip: 'بعد الغسول مباشرة' },
          { emoji: '', label: 'كيف', tip: 'بقطنة أو براحة اليد' },
          { emoji: '', label: 'أي نوع', tip: 'حسب نوع بشرتكِ' },
        ].map((t) => (
          <div key={t.label} className="rounded-lg bg-sky-50 px-2.5 py-2 dark:bg-sky-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-sky-800 dark:text-sky-200">{t.label}</p>
            <p className="text-[9px] text-sky-600 dark:text-sky-400">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
