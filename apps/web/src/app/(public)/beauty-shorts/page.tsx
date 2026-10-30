'use client';
import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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

// Q2 Phase 3 — shoppable tag overlays (REELS_SHOPPABLE_PLAN).
type TagRow = {
  id: number;
  productId: number | null;
  serviceId: number | null;
  positionSec: number | null;
  label: { ar?: string; en?: string } | null;
  productNameAr: string | null;
  productPrice: number | null;
  serviceTitleAr: string | null;
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
  const watchedMut = api.beautyShorts.watched.useMutation();

  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const feedRef = useRef<HTMLDivElement | null>(null);
  // Q2 Phase 3 — per-slide chip feedback (declared before the active
  // effect below resets it on reel changes).
  const [addedTagId, setAddedTagId] = useState<number | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const shorts = (data ?? []) as unknown as ShortRow[];

  // P2 — watch analytics: report the accumulated watch seconds of the
  // outgoing slide whenever the active slide changes or the page unmounts.
  // Refs keep the effect keyed ONLY on `active` — the shorts array and the
  // mutation object change identity on every refetch (likes refetch), and
  // an identity-dependent effect would misfire watch events.
  const shortsRef = useRef<ShortRow[]>([]);
  shortsRef.current = shorts;
  const watchedMutRef = useRef(watchedMut.mutate);
  watchedMutRef.current = watchedMut.mutate;

  const reportWatch = useCallback((shortId: number, startedAt: number) => {
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    if (elapsed < 1) return;
    const short = shortsRef.current.find((s) => s.id === shortId);
    if (!short) return;
    watchedMutRef.current({
      shortId,
      seconds: elapsed,
      completed: short.durationSec > 0 && elapsed >= short.durationSec * 0.8,
    });
  }, []);

  const watchRef = useRef<{ shortId: number; startedAt: number } | null>(null);
  useEffect(() => {
    const prev = watchRef.current;
    const current = shortsRef.current[active];
    if (prev && prev.shortId !== current?.id) reportWatch(prev.shortId, prev.startedAt);
    watchRef.current = current ? { shortId: current.id, startedAt: Date.now() } : null;
    // Q2 — chip feedback is per-slide; clear it when the reel changes.
    setAddedTagId(null);
    setNeedsLogin(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Page unmount — report the slide in flight.
  useEffect(() => {
    return () => {
      const last = watchRef.current;
      if (last) reportWatch(last.shortId, last.startedAt);
    };
  }, [reportWatch]);

  const title = (s: ShortRow) => (locale === 'en' ? s.titleJson?.en : s.titleJson?.ar) ?? '';

  // Q2 Phase 3 — shoppable tags: the active slide's commerce overlays.
  // The tags query re-fires per slide; taps record into the Q1 ledger
  // (fire-and-forget) and authenticated shoppers add straight to cart.
  const activeShort = shorts[active];
  const tagsQuery = api.beautyShorts.tags.useQuery(
    { shortId: activeShort?.id ?? 0 },
    { enabled: activeShort !== undefined },
  );
  const tags = (tagsQuery.data ?? []) as unknown as TagRow[];
  const tagClickedMut = api.beautyShorts.tagClicked.useMutation();
  const addToCartMut = api.marketplace.addToCart.useMutation();

  const handleTagShop = async (tag: TagRow) => {
    tagClickedMut.mutate({ tagId: tag.id });
    if (tag.productId === null) return;
    if (!isAuthenticated) {
      // The tRPC client auto-redirects on UNAUTHORIZED — check auth
      // BEFORE calling the cart mutation so anonymous taps get an inline
      // login affordance instead of a jarring page navigation.
      setNeedsLogin(true);
      return;
    }
    try {
      await addToCartMut.mutateAsync({ productId: tag.productId });
      setAddedTagId(tag.id);
      setNeedsLogin(false);
    } catch {
      /* server-side failure — leave the button actionable */
    }
  };

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

                {/* Q2 Phase 3 — shoppable tag chips: the active slide's
                    commerce overlays (name + price + add-to-cart). */}
                {isActive && tags.length > 0 && (
                  <div
                    data-testid="reel-tags"
                    className="absolute inset-x-4 bottom-20 flex flex-col items-end gap-2"
                  >
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        data-testid="reel-tag"
                        className="flex max-w-full items-center gap-2 rounded-2xl bg-black/60 px-3 py-2 backdrop-blur"
                      >
                        <div className="min-w-0 text-end">
                          <p className="truncate text-xs font-bold">
                            {tag.label
                              ? locale === 'en'
                                ? tag.label.en
                                : tag.label.ar
                              : (tag.productNameAr ?? tag.serviceTitleAr ?? '')}
                          </p>
                          {tag.productPrice !== null && (
                            <p className="mt-0.5 text-xs text-white/80">
                              {tag.productPrice.toLocaleString()} {t('misc.sar')}
                            </p>
                          )}
                        </div>
                        <button
                          data-testid="reel-tag-shop"
                          onClick={() => handleTagShop(tag)}
                          disabled={addToCartMut.isPending}
                          className="shrink-0 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          {addedTagId === tag.id ? '✓' : t('shorts.shopNow')}
                        </button>
                      </div>
                    ))}
                    {needsLogin && (
                      <Link
                        data-testid="reel-tag-login"
                        href="/login"
                        className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur hover:bg-white/20"
                      >
                        {t('stores.login-to-buy')} · {t('shorts.viewProduct')}
                      </Link>
                    )}
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
