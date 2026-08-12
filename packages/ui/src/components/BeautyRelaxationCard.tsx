'use client';

import { cn } from '@galaxy/shared';

interface BeautyRelaxationCardProps {
  className?: string;
}

export function BeautyRelaxationCard({ className = '' }: BeautyRelaxationCardProps): JSX.Element {
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
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">طقوس الاسترخاء</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">روتين مسائي للاسترخاء</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          { emoji: '', step: 'حمام دافئ بملح إنكليزي', time: '20 دقيقة' },
          { emoji: '️', step: 'إطفاء الأضواء وإشعال شمعة', time: '—' },
          { emoji: '', step: 'ترطيب الجسم بالكامل', time: '5 دقائق' },
          { emoji: '', step: 'الاستعداد للنوم العميق', time: '8 ساعات' },
        ].map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-[9px] font-bold text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300">
              {i + 1}
            </span>
            <span className="flex-1 text-[10px] text-indigo-800 dark:text-indigo-200">
              {s.step}
            </span>
            <span className="text-[9px] text-indigo-500 dark:text-indigo-400">{s.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
