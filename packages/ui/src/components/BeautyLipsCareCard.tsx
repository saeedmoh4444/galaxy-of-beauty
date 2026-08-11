'use client';

import { cn } from '@galaxy/shared';

interface BeautyLipsCareCardProps {
  className?: string;
}

export function BeautyLipsCareCard({ className = '' }: BeautyLipsCareCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">💋</span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">عناية بالشفاه</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">شفاه ناعمة ورطبة</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '💧', label: 'ترطيب دائم', tip: 'بلسم شفاه كل ساعتين' },
          { emoji: '☀️', label: 'حماية SPF', tip: 'الشفاه تحتاج واقي شمس' },
          { emoji: '🚫', label: 'لا تلعقي', tip: 'اللعاب يجفف الشفاه' },
          { emoji: '🍯', label: 'ماسك عسل', tip: 'عسل + سكر = تقشير لطيف' },
        ].map((t) => (
          <div key={t.label} className="rounded-lg bg-rose-50 px-2.5 py-2 dark:bg-rose-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-200">
              {t.label}
            </p>
            <p className="text-[9px] text-rose-600 dark:text-rose-400">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
