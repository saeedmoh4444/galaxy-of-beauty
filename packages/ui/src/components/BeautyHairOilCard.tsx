'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairOilCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🫒</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">زيوت الشعر</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">أي زيت لشعرك؟</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '🥥', label: 'جوز الهند', tip: 'يخترق الشعرة — ترطيب عميق' },
          { emoji: '🫒', label: 'الأرغان', tip: 'ذهبي — للمعان وتغذية' },
          { emoji: '🌿', label: 'إكليل الجبل', tip: 'يحفز نمو الشعر' },
          { emoji: '💧', label: 'الجوجوبا', tip: 'يشبه زيوت فروة الرأس' },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
              {t.label}
            </p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
