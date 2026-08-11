'use client';
import { cn } from '@galaxy/shared';
export function BeautyAcneScarsCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-red-100 bg-white p-4 dark:border-red-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🩹</span>
        <div>
          <h4 className="text-sm font-bold text-red-700 dark:text-red-300">ندبات الحبوب</h4>
          <p className="text-[10px] text-red-500 dark:text-red-400">أنواع الندبات وعلاج كل نوع</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '🕳️', label: 'حفر', tip: 'ندبات عميقة — تحتاج ليزر أو فيلر' },
          { emoji: '🔴', label: 'حمراء', tip: 'حديثة — تختفي مع الوقت' },
          { emoji: '🟤', label: 'بنية', tip: 'تصبغات — تقشير وفيتامين C' },
          { emoji: '📈', label: 'بارزة', tip: 'ندبات متضخمة — كورتيزون موضعي' },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-red-50 px-2.5 py-2 dark:bg-red-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-red-800 dark:text-red-200">{t.label}</p>
            <p className="text-[9px] text-red-600 dark:text-red-400">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
