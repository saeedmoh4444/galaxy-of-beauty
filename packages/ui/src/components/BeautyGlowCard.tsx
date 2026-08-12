'use client';

import { cn } from '@galaxy/shared';

interface BeautyGlowCardProps {
  className?: string;
}

export function BeautyGlowCard({ className = '' }: BeautyGlowCardProps): JSX.Element {
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
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">أسرار الإشراقة</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">بشرة متوهجة من الداخل</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          { emoji: '', text: '8 أكواب ماء يومياً — أساس الإشراقة' },
          { emoji: '', text: 'خضروات وفواكه ملونة = فيتامينات' },
          { emoji: '', text: '7-8 ساعات نوم — بشرة متجددة' },
          { emoji: '', text: 'حركة 30 دقيقة — دورة دموية أفضل' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-rose-800 dark:text-rose-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
