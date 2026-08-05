'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Vlog Card — technician "Day in the Life" video series.
 * From Phase W4: Sisterhood & Community — Beauty Stories.
 *
 * Usage:
 *   <BeautyVlogCard vlog={{ title: 'يوم في حياة نورة', technician: 'نورة', duration: '8 دقائق' }} />
 */

interface Vlog {
  title: string;
  technician: string;
  duration: string;
  views?: number;
  category?: string;
}

interface BeautyVlogCardProps {
  vlog: Vlog;
  onWatch?: () => void;
  className?: string;
}

export function BeautyVlogCard({
  vlog,
  onWatch,
  className = '',
}: BeautyVlogCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Thumbnail placeholder */}
      <div className="relative rounded-xl bg-gradient-to-br from-rose-200 to-pink-200 p-8 text-center dark:from-rose-900 dark:to-pink-900">
        <span className="text-4xl" aria-hidden="true">🎬</span>
        <button
          type="button"
          onClick={onWatch}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-xl shadow-lg hover:bg-white transition-all active:scale-95 dark:bg-gray-800/80">
            ▶️
          </span>
        </button>
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
          {vlog.duration}
        </span>
      </div>

      {/* Info */}
      <div className="mt-2">
        <p className="text-xs font-bold text-text-primary dark:text-gray-100">
          {vlog.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-text-tertiary dark:text-gray-500">
          <span>👩‍🎨 {vlog.technician}</span>
          {vlog.category && <span>· {vlog.category}</span>}
        </div>
        {vlog.views && (
          <p className="mt-0.5 text-[9px] text-text-tertiary dark:text-gray-500">
            👁️ {vlog.views.toLocaleString('ar-SA')} مشاهدة
          </p>
        )}
      </div>

      {/* Watch CTA */}
      <button
        type="button"
        onClick={onWatch}
        className="mt-2 w-full rounded-lg bg-rose-600 py-1.5 text-[10px] font-bold text-white hover:bg-rose-700 active:scale-[0.98] transition-all"
      >
        ▶️ شاهدي الفلوق
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        🎬 يوميات خبيراتنا — من القلب مباشرة
      </p>
    </div>
  );
}
