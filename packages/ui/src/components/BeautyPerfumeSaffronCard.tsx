'use client';
import { cn } from '@galaxy/shared';
export function BeautyPerfumeSaffronCard({ className = '' }: { className?: string }): JSX.Element {
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
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">الزعفران</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">الذهب الأحمر في العطور</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'أغلى توابل العالم — يستخدم في العطور الفاخرة' },
          { emoji: '', text: 'رائحة حارة ومعدنية — أنيقة ومميزة' },
          { emoji: '', text: 'يستخدم في ماسكات الوجه — لتفتيح البشرة' },
          { emoji: '', text: 'العربية السعودية — تاريخ طويل مع الزعفران' },
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
