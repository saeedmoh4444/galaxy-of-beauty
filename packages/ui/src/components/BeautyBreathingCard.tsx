'use client';

import { cn } from '@galaxy/shared';

interface BeautyBreathingCardProps { className?: string; }

export function BeautyBreathingCard({ className = '' }: BeautyBreathingCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5 dark:border-sky-900 dark:from-sky-950 dark:to-blue-950', className)}>
      <div className="text-center">
        <span className="text-3xl">🫁</span>
        <h4 className="mt-1 text-sm font-bold text-sky-800 dark:text-sky-200">تنفس الجمال</h4>
        <p className="text-[10px] text-sky-500 dark:text-sky-400">تقنية 4-7-8 للاسترخاء</p>
      </div>
      <div className="mt-3 space-y-2">
        {[{ emoji: '🫁', step: 'شهيق من الأنف', count: '4 ثوانٍ' },{ emoji: '✋', step: 'احبسي النفس', count: '7 ثوانٍ' },{ emoji: '😮', step: 'زفير من الفم', count: '8 ثوانٍ' },{ emoji: '🔄', step: 'كرري 4 مرات', count: 'دقيقتان' }].map((s, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2.5 dark:bg-gray-800/60">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-700 dark:bg-sky-800 dark:text-sky-300">{i + 1}</span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{s.step}</span>
          </div>
          <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300">{s.count}</span>
        </div>))}
      </div>
      <p className="mt-2 text-center text-[9px] text-sky-600 dark:text-sky-400">🫁 التنفس العميق = بشرة مشرقة + عقل هادئ</p>
    </div>
  );
}
