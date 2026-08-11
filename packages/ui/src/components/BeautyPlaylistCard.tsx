'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Playlist Card — curated spa & relaxation music playlists.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautyPlaylistCard />
 */

interface Track {
  title: string;
  duration: string;
  emoji: string;
}

const TRACKS: Track[] = [
  { title: 'أمواج البحر', duration: '4:30', emoji: '🌊' },
  { title: 'صوت المطر', duration: '5:15', emoji: '🌧️' },
  { title: 'عود هادئ', duration: '3:45', emoji: '🎵' },
  { title: 'تأمل الصباح', duration: '6:00', emoji: '🧘' },
];

interface BeautyPlaylistCardProps {
  className?: string;
}

export function BeautyPlaylistCard({ className = '' }: BeautyPlaylistCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          🎵
        </span>
        <div>
          <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">موسيقى الجمال</h4>
          <p className="text-[10px] text-violet-500 dark:text-violet-400">
            قائمة تشغيل للاسترخاء أثناء جلستكِ
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {TRACKS.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-950"
          >
            <span className="text-sm">{t.emoji}</span>
            <span className="flex-1 text-[10px] font-medium text-violet-800 dark:text-violet-200">
              {t.title}
            </span>
            <span className="text-[10px] text-violet-500 dark:text-violet-400">{t.duration}</span>
            <span className="text-violet-400 text-xs">▶️</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-1.5">
        {['استرخاء', 'تركيز', 'طاقة', 'نوم'].map((mood) => (
          <span
            key={mood}
            className="rounded-full bg-violet-50 px-2 py-0.5 text-[9px] text-violet-600 dark:bg-violet-950 dark:text-violet-400"
          >
            {mood}
          </span>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        🎵 اختاري الموسيقى التي تحبينها لجلسة مثالية
      </p>
    </div>
  );
}
