'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Scarf Card — hijab and scarf styling tips.
 * From Phase W4: Sisterhood & Community — Hijabi Beauty.
 */
interface BeautyScarfCardProps {
  className?: string;
}

export function BeautyScarfCard({ className = '' }: BeautyScarfCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🧕</span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">أناقة الحجاب</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">أفكار لتنسيق حجابك</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '🎨', label: 'ألوان متناسقة', tip: 'الحجاب مع لون الفستان' },
          { emoji: '🧷', label: 'تثبيت محكم', tip: 'دبابيس غير ظاهرة' },
          { emoji: '🌿', label: 'بطانة حرير', tip: 'تحمي الشعر من التكسر' },
          { emoji: '👒', label: 'تغيير الأسلوب', tip: 'جربي لفات جديدة' },
        ].map((t) => (
          <div key={t.label} className="rounded-lg bg-emerald-50 px-2.5 py-2 dark:bg-emerald-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
              {t.label}
            </p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
