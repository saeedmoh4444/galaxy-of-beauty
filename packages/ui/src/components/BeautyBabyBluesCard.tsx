'use client';
import { cn } from '@galaxy/shared';
export function BeautyBabyBluesCard({ className = '' }: { className?: string }): JSX.Element {
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
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
            عناية الأم بعد الولادة
          </h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">نفسكِ مهمة — مثل طفلكِ</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '🪞', text: '5 دقائق لكِ — غسل وجه وتنفس عميق' },
          { emoji: '', text: 'لا تنعزلي — تحدثي مع صديقة أو أخت' },
          { emoji: '🩺', text: 'اكتئاب ما بعد الولادة — ليس ضعفاً' },
          { emoji: '', text: 'أنتِ أم رائعة — لا تقسي على نفسكِ' },
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
