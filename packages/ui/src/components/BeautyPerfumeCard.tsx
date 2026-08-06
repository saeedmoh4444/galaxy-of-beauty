'use client';

import { cn } from '@galaxy/shared';

const TIPS = [
  { emoji: '💪', title: 'نقاط النبض', desc: 'المعصم، خلف الأذن، المرفق' },
  { emoji: '🧴', title: 'رطبي أولاً', desc: 'البشرة المرطبة تثبت العطر أطول' },
  { emoji: '🚫', title: 'لا تفركي', desc: 'الفرك يكسر جزيئات العطر' },
  { emoji: '🌡️', title: 'تخزين صحيح', desc: 'مكان بارد ومظلم — ليس الحمام' },
];

interface BeautyPerfumeCardProps { className?: string; }

export function BeautyPerfumeCard({ className = '' }: BeautyPerfumeCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900', className)}>
      <div className="flex items-center gap-2"><span className="text-xl">🌸</span><div><h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">أسرار العطر</h4><p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">كيف تجعلين عطرك يدوم</p></div></div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {TIPS.map((t) => (<div key={t.title} className="rounded-lg bg-fuchsia-50 px-2.5 py-2 dark:bg-fuchsia-950"><span className="text-sm">{t.emoji}</span><p className="mt-0.5 text-[10px] font-bold text-fuchsia-800 dark:text-fuchsia-200">{t.title}</p><p className="text-[9px] text-fuchsia-600 dark:text-fuchsia-400">{t.desc}</p></div>))}
      </div>
    </div>
  );
}
