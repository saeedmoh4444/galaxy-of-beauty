'use client';

import { cn } from '@galaxy/shared';

interface BeautyPostureCardProps { className?: string; }

export function BeautyPostureCard({ className = '' }: BeautyPostureCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900', className)}>
      <div className="flex items-center gap-2"><span className="text-xl">🧍‍♀️</span><div><h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">قوام جميل</h4><p className="text-[10px] text-purple-500 dark:text-purple-400">الوقفة الصحيحة = ثقة وجمال</p></div></div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[{ emoji: '⬆️', label: 'ارفعي ذقنك', tip: 'موازية للأرض' },{ emoji: '↩️', label: 'أكتاف للخلف', tip: 'تفتح الصدر' },{ emoji: '🧍', label: 'ظهر مستقيم', tip: 'لا تنحني للأمام' },{ emoji: '👣', label: 'وزن متوازن', tip: 'على القدمين بالتساوي' }].map((t) => (<div key={t.label} className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-950"><span className="text-sm">{t.emoji}</span><p className="mt-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-200">{t.label}</p><p className="text-[9px] text-purple-600 dark:text-purple-400">{t.tip}</p></div>))}
      </div>
    </div>
  );
}
