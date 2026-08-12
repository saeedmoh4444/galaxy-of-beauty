'use client';
import { cn } from '@galaxy/shared';
export function BeautyPerfumeLayerCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">طبقات العطر</h4>
          <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">كيف تختارين عطرك</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'النفحة العليا: أول ما تشمين — حمضيات، خفيفة' },
          { emoji: '', text: 'قلب العطر: بعد 15 دقيقة — ورود، توابل' },
          { emoji: '🪵', text: 'القاعدة: بعد ساعة — خشب، مسك، فانيليا' },
          { emoji: '', text: 'انتظري 30 دقيقة قبل الحكم على العطر' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-fuchsia-50 px-3 py-2 dark:bg-fuchsia-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-fuchsia-800 dark:text-fuchsia-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
