'use client';
import { cn } from '@galaxy/shared';
export function BeautyCelluliteCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🍊</span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">السيلوليت</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">علاج مظهر قشر البرتقال</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '💆', text: 'مساج التصريف اللمفاوي — يقلل الاحتباس' },
          { emoji: '🏃', text: 'رياضة منتظمة — تحسن الدورة الدموية' },
          { emoji: '💧', text: 'اشربي ماء — الترطيب يحسن مظهر الجلد' },
          { emoji: '🫒', text: 'كافيين موضعي — كريمات تنشط الدورة' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-orange-800 dark:text-orange-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
