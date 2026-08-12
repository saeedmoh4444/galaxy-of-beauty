'use client';
import { cn } from '@galaxy/shared';
export function BeautyBridalGlowCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            إشراقة العروس
          </h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
            توهجي في يومكِ الكبير
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: '8 أكواب ماء يومياً — لمدة شهر قبل الزفاف' },
          { emoji: '', text: 'غذاء صحي — أفوكادو، سلمون، مكسرات' },
          { emoji: '', text: '8 ساعات نوم — أهم سر للبشرة' },
          { emoji: '', text: 'تأمل 10 دقائق — هدوء وثقة في يومكِ' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
