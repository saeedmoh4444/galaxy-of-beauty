'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupBlushCard({ className = '' }: { className?: string }): JSX.Element {
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
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">أحمر الخدود</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">لمسة حيوية لوجهك</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'ابتسمي — ضعيه على تفاحة الخد' },
          { emoji: '️', text: 'ادمجيه للأعلى — نحو الصدغ' },
          { emoji: '', text: 'كريمي للبشرة الجافة — بودرة للدهنية' },
          { emoji: '', text: 'القليل كثير — ابدئي بكمية صغيرة' },
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
