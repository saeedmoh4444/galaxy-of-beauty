'use client';
import { cn } from '@galaxy/shared';
export function BeautyGlassSkinCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">✨</span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">البشرة الزجاجية</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">سر البشرة الكورية الصافية</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '💧', text: '7 طبقات ترطيب — تونر خفيف يطبق 7 مرات' },
          { emoji: '✨', text: 'طبقات رقيقة — كل طبقة تمتص قبل التالية' },
          { emoji: '🧖', text: 'تقشير منتظم — أساس البشرة الزجاجية' },
          { emoji: '☀️', text: 'واقي شمس يومي — حماية من التصبغات' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
