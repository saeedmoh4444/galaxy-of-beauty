'use client';

import { cn } from '@galaxy/shared';

interface BeautySelfMassageCardProps {
  className?: string;
}

export function BeautySelfMassageCard({ className = '' }: BeautySelfMassageCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">‍️</span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">مساج ذاتي</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">5 دقائق يومياً لبشرة مشرقة</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          { emoji: '', name: 'تدليك دائري', desc: 'بأطراف الأصابع على الوجنتين' },
          { emoji: '️', name: 'رفع الجبهة', desc: 'من الحواجب لأعلى — 10 مرات' },
          { emoji: '', name: 'تدليك الفك', desc: 'حركات دائرية على مفصل الفك' },
          { emoji: '️', name: 'منطقة العين', desc: 'تربيت خفيف — لا تسحبِ' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-rose-800 dark:text-rose-200">{t.name}</p>
              <p className="text-[9px] text-rose-600 dark:text-rose-400">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
