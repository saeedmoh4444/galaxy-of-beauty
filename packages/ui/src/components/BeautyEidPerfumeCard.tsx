'use client';
import { cn } from '@galaxy/shared';
export function BeautyEidPerfumeCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">عطر العيد</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">
            العطر المثالي ليوم العيد
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'عود وورد — كلاسيكية العيد' },
          { emoji: '', text: 'طبقات العطر — قاعدة + قلب + نفحة عليا' },
          { emoji: '', text: 'قبل الخروج بساعة — ليثبت العطر' },
          { emoji: '', text: 'عطر جديد للعيد — تقليد جميل' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-indigo-800 dark:text-indigo-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
