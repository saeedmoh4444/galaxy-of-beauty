'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Progress Photo Card — before/after progress photo gallery.
 * From Phase W3: Health & Wellness & W1: Privacy.
 *
 * Usage:
 *   <BeautyProgressPhotoCard photos={[{ date: '2026-01', emoji: '🧴', note: 'بداية الروتين' }]} />
 */

interface ProgressPhoto {
  date: string;
  emoji: string;
  note: string;
  imageUrl?: string;
}

interface BeautyProgressPhotoCardProps {
  photos: ProgressPhoto[];
  onAddPhoto?: () => void;
  className?: string;
}

export function BeautyProgressPhotoCard({ photos, onAddPhoto, className = '' }: BeautyProgressPhotoCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">📸</span>
          <div>
            <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">صور التقدم</h4>
            <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{photos.length} صورة</p>
          </div>
        </div>
        <button type="button" onClick={onAddPhoto} className="rounded-lg bg-indigo-100 p-1.5 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" /></svg>
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {photos.map((p, i) => (
          <div key={i} className="flex-shrink-0 w-24 rounded-xl bg-indigo-50 p-2 text-center dark:bg-indigo-950">
            <span className="text-2xl">{p.emoji}</span>
            <p className="mt-1 text-[9px] font-bold text-indigo-700 dark:text-indigo-300">{p.date}</p>
            <p className="text-[8px] text-indigo-500 dark:text-indigo-400 truncate">{p.note}</p>
          </div>
        ))}
        <button type="button" onClick={onAddPhoto} className="flex-shrink-0 w-24 rounded-xl border-2 border-dashed border-indigo-200 p-2 flex flex-col items-center justify-center text-indigo-400 hover:border-indigo-300 dark:border-indigo-800">
          <span className="text-2xl">+</span>
          <span className="mt-1 text-[9px]">أضيفي</span>
        </button>
      </div>
    </div>
  );
}
