'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Podcast Card — "Saudi Women in Beauty" podcast series.
 * From Phase W4: Sisterhood & Community — Beauty Stories.
 *
 * Usage:
 *   <BeautyPodcastCard episode={{ title: 'قصة نجاح نورة', guest: 'نورة القحطاني', duration: '32 دقيقة' }} />
 */

interface PodcastEpisode {
  title: string;
  guest: string;
  guestTitle?: string;
  duration: string;
  episodeNumber?: number;
  description?: string;
}

interface BeautyPodcastCardProps {
  episode: PodcastEpisode;
  onListen?: () => void;
  onSubscribe?: () => void;
  className?: string;
}

export function BeautyPodcastCard({
  episode,
  onListen,
  onSubscribe,
  className = '',
}: BeautyPodcastCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Podcast badge */}
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-200 to-pink-200 text-lg dark:from-rose-800 dark:to-pink-800">
          ️
        </div>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">
            نساء سعوديات في الجمال
          </h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">
            بودكاست — قصص ملهمة من قلب المملكة
          </p>
        </div>
        {episode.episodeNumber && (
          <span className="ml-auto shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            حلقة {episode.episodeNumber}
          </span>
        )}
      </div>

      {/* Episode card */}
      <div className="mt-3 rounded-xl bg-rose-50 p-3 dark:bg-rose-950">
        <p className="text-xs font-bold text-text-primary dark:text-gray-100">{episode.title}</p>

        {/* Guest */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm dark:bg-gray-700">
            ‍
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
              {episode.guest}
            </p>
            {episode.guestTitle && (
              <p className="text-[9px] text-text-tertiary dark:text-gray-500">
                {episode.guestTitle}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {episode.description && (
          <p className="mt-1.5 text-[10px] leading-relaxed text-text-secondary dark:text-gray-300">
            {episode.description}
          </p>
        )}

        {/* Duration + Listen */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-text-tertiary dark:text-gray-500">
            ️ {episode.duration}
          </span>
          <button
            type="button"
            onClick={onListen}
            className="flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-rose-700 active:scale-95 transition-all"
          >
            ▶️ استمعي
          </button>
        </div>
      </div>

      {/* Subscribe */}
      <button
        type="button"
        onClick={onSubscribe}
        className="mt-2 w-full rounded-xl border border-rose-200 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950 transition-colors"
      >
        تابعي البودكاست
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        ️ متوفر على أبل بودكاست، سبوتيفاي، وجميع المنصات
      </p>
    </div>
  );
}
