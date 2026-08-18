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
  title: { ar: string; en: string };
  duration: string;
  emoji: string;
}

const TRACKS: Track[] = [
  { title: { ar: 'أمواج البحر', en: 'Sea waves' }, duration: '4:30', emoji: '' },
  { title: { ar: 'صوت المطر', en: 'Rain sounds' }, duration: '5:15', emoji: '️' },
  { title: { ar: 'عود هادئ', en: 'Calm oud' }, duration: '3:45', emoji: '' },
  { title: { ar: 'تأمل الصباح', en: 'Morning meditation' }, duration: '6:00', emoji: '' },
];

interface BeautyPlaylistCardProps {
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  footerText?: string;
  className?: string;
}

export function BeautyPlaylistCard({
  className = '',
  locale = 'ar',
  title = 'موسيقى الجمال',
  subtitle = 'قائمة تشغيل للاسترخاء أثناء جلستكِ',
  footerText = 'اختاري الموسيقى التي تحبينها لجلسة مثالية',
}: BeautyPlaylistCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">{title}</h4>
          <p className="text-[10px] text-violet-500 dark:text-violet-400">{subtitle}</p>
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
              {t.title[locale]}
            </span>
            <span className="text-[10px] text-violet-500 dark:text-violet-400">{t.duration}</span>
            <span className="text-violet-400 text-xs">▶️</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-1.5">
        {[
          { ar: 'استرخاء', en: 'Relax' },
          { ar: 'تركيز', en: 'Focus' },
          { ar: 'طاقة', en: 'Energy' },
          { ar: 'نوم', en: 'Sleep' },
        ].map((mood) => (
          <span
            key={mood.ar}
            className="rounded-full bg-violet-50 px-2 py-0.5 text-[9px] text-violet-600 dark:bg-violet-950 dark:text-violet-400"
          >
            {mood[locale]}
          </span>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
