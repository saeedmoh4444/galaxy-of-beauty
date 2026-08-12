'use client';

import { cn } from '@galaxy/shared';

const TIPS = [
  { emoji: '', title: 'الترطيب أولاً', desc: 'بشرة مرطبة = مكياج أجمل وأثبت' },
  { emoji: '️', title: 'نظفي فرشك', desc: 'أسبوعياً — البكتيريا تتراكم' },
  { emoji: '', title: 'تاريخ الصلاحية', desc: 'جددِي مكياجك كل 6-12 شهر' },
  { emoji: '', title: 'أزيلي المكياج', desc: 'لا تنامي أبداً بالمكياج' },
];

interface BeautyMakeupTipsCardProps {
  className?: string;
}

export function BeautyMakeupTipsCard({ className = '' }: BeautyMakeupTipsCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">نصائح المكياج</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">لإطلالة تدوم طويلاً</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {TIPS.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-rose-800 dark:text-rose-200">{t.title}</p>
              <p className="text-[9px] text-rose-600 dark:text-rose-400">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
