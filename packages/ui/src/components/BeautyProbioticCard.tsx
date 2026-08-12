'use client';
import { cn } from '@galaxy/shared';
export function BeautyProbioticCard({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">البروبيوتيك</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">بكتيريا نافعة — بشرة صافية</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          { emoji: '', text: 'صحة الأمعاء = بشرة نقية — اتصال مباشر' },
          { emoji: '', text: 'يقلل الالتهابات — مفيد للحبوب والإكزيما' },
          { emoji: '', text: 'زبادي، كفير، مخللات — مصادر طبيعية' },
          { emoji: '', text: 'كبسولات بروبيوتيك — تركيز أعلى' },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-teal-800 dark:text-teal-200">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
