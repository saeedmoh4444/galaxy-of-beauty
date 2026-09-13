'use client';
import { api } from '@/lib/trpc';
import { CardListSkeleton, useAuth } from '@galaxy/ui';
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

export default function BeautyShortsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, refetch } = api.beautyShorts.feed.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const likeMut = api.beautyShorts.like.useMutation({ onSuccess: () => refetch() });
  const viewedMut = api.beautyShorts.viewed.useMutation({ onSuccess: () => refetch() });

  const shorts = (data ?? []) as unknown as ShortRow[];

  const title = (s: ShortRow) => (locale === 'en' ? s.titleJson?.en : s.titleJson?.ar) ?? '';

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl">🎬</span>
        <h1 className="mt-4 text-3xl font-bold">{t('beautyShorts.title')}</h1>
        <p className="mt-2 text-text-secondary">{t('beautyShorts.subtitle')}</p>
        <p className="mt-2 text-xs text-text-tertiary">{t('beautyShorts.privacy')}</p>
      </div>
      {isLoading ? (
        <CardListSkeleton count={3} />
      ) : (
        <div className="space-y-4">
          {shorts.map((s) => (
            <div
              key={s.id}
              className="relative h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white"
            >
              {s.videoUrl ? (
                <video
                  src={s.videoUrl}
                  poster={s.thumbnailUrl ?? undefined}
                  controls
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                  onPlay={() => viewedMut.mutate({ shortId: s.id })}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center">
                  {s.type === 'before_after' ? (
                    <span className="text-5xl">✨</span>
                  ) : (
                    <span className="text-6xl">
                      {s.category === 'makeup' ? '💄' : s.category === 'hair' ? '💇‍♀️' : '🧴'}
                    </span>
                  )}
                  <p className="mt-4 px-4 text-center font-bold">{title(s)}</p>
                  {s.faceBlurred && (
                    <span className="mt-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                      {t('beautyShorts.faceBlurred')}
                    </span>
                  )}
                </div>
              )}
              <div className="absolute bottom-4 start-4 end-4 flex items-center justify-between text-sm">
                <span>👁️ {s.views.toLocaleString()}</span>
                <button
                  disabled={!isAuthenticated || likeMut.isPending}
                  onClick={() => likeMut.mutate({ shortId: s.id })}
                  className="rounded-full bg-white/10 px-3 py-1 backdrop-blur disabled:opacity-50"
                >
                  ❤️ {t('beautyShorts.like')}
                </button>
              </div>
            </div>
          ))}
          {shorts.length === 0 && (
            <p className="text-center text-text-tertiary">{t('beautyShorts.empty')}</p>
          )}
        </div>
      )}
    </div>
  );
}
