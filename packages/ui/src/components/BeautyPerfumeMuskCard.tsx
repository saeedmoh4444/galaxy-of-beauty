'use client';
import { cn } from '@galaxy/shared';
export function BeautyPerfumeMuskCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🦌</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">المسك</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">أساس العطور العربية</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '🤍', text: 'المسك الأبيض — أنقى وأخف أنواع المسك' },
          { emoji: '🌸', text: 'يدمج مع الورد — للعطور النسائية' },
          { emoji: '🪵', text: 'يدمج مع العود — للعطور القوية' },
          { emoji: '💧', text: 'زيت المسك — يدوم أطول من العطر الكحولي' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
