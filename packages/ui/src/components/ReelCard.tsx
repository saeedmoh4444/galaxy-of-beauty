'use client';

import { useState } from 'react';

/**
 * ReelCard — a vertical beauty reel tile (Phase 3 sprint 1, E7 home).
 * Thumbnail with duration + views chips, hover-play on web (muted),
 * graceful gradient placeholder when no image exists. Presentational —
 * the caller wraps it in the link.
 */

function formatDuration(totalSec: number): string {
  if (totalSec <= 0) return '';
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatViews(views: number): string {
  if (views >= 1000) {
    const k = (views / 1000).toFixed(1).replace(/\.0$/, '');
    return `${k}K`;
  }
  return String(views);
}

export function ReelCard({
  title,
  videoUrl,
  thumbnailUrl,
  beforeImageUrl,
  durationSec,
  views,
  className = '',
}: {
  title: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  /** before_after shorts use the "before" side as their poster. */
  beforeImageUrl?: string | null;
  durationSec: number;
  views: number;
  className?: string;
}): JSX.Element {
  const [hovering, setHovering] = useState(false);
  const [failed, setFailed] = useState(false);
  const poster = thumbnailUrl ?? beforeImageUrl;

  return (
    <div
      data-testid="reel-card"
      className={`w-44 ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-surface-muted">
        {hovering && videoUrl ? (
          <video
            src={videoUrl}
            poster={poster ?? undefined}
            muted
            autoPlay
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : poster && !failed ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={title}
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-accent-100"
          >
            <span aria-hidden className="text-4xl">
              🎬
            </span>
          </div>
        )}
        {durationSec > 0 && (
          <span className="absolute bottom-2 start-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {formatDuration(durationSec)}
          </span>
        )}
        <span className="absolute bottom-2 end-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
          <span aria-hidden>👁</span> {formatViews(views)}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs font-semibold text-text-primary">{title}</p>
    </div>
  );
}
