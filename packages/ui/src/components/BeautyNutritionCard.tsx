'use client';

import { cn } from '@galaxy/shared';

interface BeautyNutritionCardProps { className?: string; }

export function BeautyNutritionCard({ className = '' }: BeautyNutritionCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900', className)}>
      <div className="flex items-center gap-2"><span className="text-xl">🥗</span><div><h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">تغذية الجمال</h4><p className="text-[10px] text-emerald-500 dark:text-emerald-400">طعامكِ هو جمالكِ</p></div></div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[{ emoji: '🥑', label: 'دهون صحية', tip: 'أفوكادو، مكسرات، زيت زيتون' },{ emoji: '🍓', label: 'مضادات أكسدة', tip: 'توت، فراولة، رمان' },{ emoji: '🥬', label: 'خضروات ورقية', tip: 'سبانخ، كيل، جرجير' },{ emoji: '🐟', label: 'أوميغا 3', tip: 'سلمون، سردين، بذور كتان' }].map((t) => (<div key={t.label} className="rounded-lg bg-emerald-50 px-2.5 py-2 dark:bg-emerald-950"><span className="text-sm">{t.emoji}</span><p className="mt-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-200">{t.label}</p><p className="text-[9px] text-emerald-600 dark:text-emerald-400">{t.tip}</p></div>))}
      </div>
    </div>
  );
}
