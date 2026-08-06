'use client';

import { cn } from '@galaxy/shared';

interface BeautySleepHygieneCardProps { className?: string; }

export function BeautySleepHygieneCard({ className = '' }: BeautySleepHygieneCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900', className)}>
      <div className="flex items-center gap-2"><span className="text-xl">😴</span><div><h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">نوم صحي</h4><p className="text-[10px] text-indigo-500 dark:text-indigo-400">عادات للنوم العميق</p></div></div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[{ emoji: '📱', label: 'لا شاشات', tip: 'قبل النوم بساعة' },{ emoji: '🌡️', label: 'غرفة باردة', tip: '18-20 درجة مئوية' },{ emoji: '🕯️', label: 'روتين ثابت', tip: 'نفس الموعد يومياً' },{ emoji: '☕', label: 'لا كافيين', tip: 'بعد الرابعة عصراً' }].map((t) => (<div key={t.label} className="rounded-lg bg-indigo-50 px-2.5 py-2 dark:bg-indigo-950"><span className="text-sm">{t.emoji}</span><p className="mt-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-200">{t.label}</p><p className="text-[9px] text-indigo-600 dark:text-indigo-400">{t.tip}</p></div>))}
      </div>
    </div>
  );
}
