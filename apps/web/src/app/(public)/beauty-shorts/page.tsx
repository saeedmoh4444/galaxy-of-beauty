'use client';
import type { JSX } from 'react';
import { useCallback, useRef, useState } from 'react';
import { api } from '@/lib/trpc';
import { CardListSkeleton, ErrorAlert, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type ShortRow = {
  id: number;
  type: string;
  titleJson: { ar?: string; en?: string };
  videoUrl: string | null;
  thumbnailUrl: string | null;
  beforeImageUrl: string | null;
  durationSec: number;
  views: number;
  category: string;
  faceBlurred: boolean;
  createdAt: string;
};

// P1 — full-screen swipe feed (REELS_SHOPPABLE_PLAN Phase 2). The feed
// snap-scrolls one reel per viewport; only slides adjacent to the active
// one mount real <video> elements (virtualization — never N videos for N
// reels), the active slide autoplays muted, and the mute button toggles
// sound. Views increment when a slide starts playing.

const VIDEO_WINDOW = 1; // mount videos within ±1 slide of the active one

export default function BeautyShortsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, refetch, isError } = api.beautyShorts.feed.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const likeMut = api.beautyShorts.like.useMutation({ onSuccess: () => refetch() });
  const viewedMut = api.beautyShorts.viewed.useMutation();

  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const feedRef = useRef<HTMLDivElement | null>(null);

  const shorts = (data ?? []) as unknown as ShortRow[];

  const title = (s: ShortRow) => (locale === 'en' ? s.titleJson?.en : s.titleJson?.ar) ?? '';

  const onScroll = useCallback(() => {
    const el = feedRef.current;
    if (!el || el.clientHeight === 0) return;
    const next = Math.round(el.scrollTop / el.clientHeight);
    setActive((prev) => (prev === next ? prev : next));
  }, []);

  if (isError) return <ErrorAlert message={t('state.error')} onRetry={() => refetch()} />;

  return (
    <div className="mx-auto flex h-[calc(100dvh-64px)] max-w-md flex-col">
      <div className="px-4 py-3 text-center">
        <h1 className="text-xl font-bold">{t('beautyShorts.title')}</h1>
        <p className="mt-1 text-xs text-text-tertiary">{t('beautyShorts.privacy')}</p>
      </div>

      {isLoading ? (
        <CardListSkeleton count={3} />
      ) : (
        <div
          ref={feedRef}
          data-testid="reels-feed"
          onScroll={onScroll}
          className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto"
        >
          {shorts.map((s, i) => {
            const near = Math.abs(i - active) <= VIDEO_WINDOW;
            const isActive = i === active;
            return (
              <section
                key={s.id}
                data-testid="reel-slide"
                className="relative h-full snap-start overflow-hidden bg-gray-900 text-white"
              >
                {s.videoUrl && near ? (
                  <video
                    src={s.videoUrl}
                    poster={s.thumbnailUrl ?? undefined}
                    autoPlay
                    muted={muted}
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                    onPlay={() => viewedMut.mutate({ shortId: s.id })}
                  >
                    {/* a11y: reels are ambient visuals; the track satisfies
                        jsx-a11y/media-has-caption without inventing captions. */}
                    <track kind="captions" srcLang="ar" />
                  </video>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    {s.type === 'before_after' ? (
                      <span className="text-5xl">✨</span>
                    ) : (
                      <span className="text-6xl">
                        {s.category === 'makeup' ? '💄' : s.category === 'hair' ? '💇‍♀️' : '🧴'}
                      </span>
                    )}
                    <p className="mt-4 px-6 text-center font-bold">{title(s)}</p>
                    {s.faceBlurred && (
                      <span className="mt-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                        {t('beautyShorts.faceBlurred')}
                      </span>
                    )}
                  </div>
                )}

                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4 pb-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{title(s)}</p>
                      <p className="mt-1 text-xs text-white/70">
                        👁️ {s.views.toLocaleString()}
                        {s.durationSec > 0 ? ` · ${s.durationSec}s` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.videoUrl && (
                        <button
                          data-testid="reel-mute"
                          aria-label={muted ? t('beautyShorts.unmute') : t('beautyShorts.mute')}
                          onClick={() => setMuted((m) => !m)}
                          className="rounded-full bg-white/10 px-3 py-2 text-sm backdrop-blur"
                        >
                          {muted ? '🔇' : '🔊'}
                        </button>
                      )}
                      <button
                        disabled={!isAuthenticated || likeMut.isPending}
                        onClick={() => likeMut.mutate({ shortId: s.id })}
                        className="rounded-full bg-white/10 px-3 py-2 text-sm backdrop-blur disabled:opacity-50"
                      >
                        ❤️ {t('beautyShorts.like')}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
          {shorts.length === 0 && (
            <p className="p-8 text-center text-text-tertiary">{t('beautyShorts.empty')}</p>
          )}
        </div>
      )}
    </div>
  );
}
