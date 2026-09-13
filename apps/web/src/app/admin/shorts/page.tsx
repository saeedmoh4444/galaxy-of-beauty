'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, EmptyState, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminShortsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();

  // E7 — media moderation queue.
  const { data, isLoading, refetch } = api.beautyShorts.adminPending.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const decideMut = api.beautyShorts.adminDecide.useMutation({ onSuccess: () => refetch() });

  const pending = (data ?? []) as Array<Record<string, any>>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.shorts.title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('admin.shorts.subtitle')}</p>
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : pending.length === 0 ? (
        <EmptyState title={t('admin.shorts.empty')} />
      ) : (
        <div className="space-y-3">
          {pending.map((s) => (
            <Card key={s.id} padding="lg">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-bold">
                    {s.type === 'before_after'
                      ? t('admin.shorts.type-before-after')
                      : t('admin.shorts.type-reel')}{' '}
                    ·{' '}
                    {locale === 'en'
                      ? ((s.titleJson as Record<string, string>)?.en ?? '')
                      : ((s.titleJson as Record<string, string>)?.ar ?? '')}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('admin.shorts.category')}: {s.category as string} · {s.durationSec as number}
                    s
                  </p>
                  {s.videoUrl && (
                    <video src={s.videoUrl as string} controls muted className="h-32 rounded-xl" />
                  )}
                  <p className="text-xs text-text-tertiary">
                    {t('admin.shorts.face-blur')}:{' '}
                    {s.faceBlurred ? t('common.yes') : t('common.no')} · {t('admin.shorts.consent')}
                    : {s.consentGiven ? t('common.yes') : t('common.no')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decideMut.mutate({ shortId: s.id, approve: false })}
                    loading={decideMut.isPending}
                  >
                    {t('admin.packages.reject')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => decideMut.mutate({ shortId: s.id, approve: true })}
                    loading={decideMut.isPending}
                  >
                    {t('admin.packages.approve')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
