'use client';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, EmptyState, useAuth, ErrorAlert } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminShortsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();

  // E7 — media moderation queue.
  const { data, isLoading, refetch, isError } = api.beautyShorts.adminPending.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const decideMut = api.beautyShorts.adminDecide.useMutation({ onSuccess: () => refetch() });

  // R6 — reported shorts (auto-hidden at 3 reports) for review/restore.
  const reportsQ = api.beautyShorts.adminReports.useQuery(undefined, { enabled: isAuthenticated });
  const reportsMut = api.beautyShorts.adminDecide.useMutation({
    onSuccess: () => reportsQ.refetch(),
  });

  // P4 — watch analytics (Phase 2): top reels by watch-seconds, 30 days.
  const watchQ = api.beautyShorts.adminWatchStats.useQuery(undefined, { enabled: isAuthenticated });

  const pending = data ?? [];

  if (isError) return <ErrorAlert message={t('state.error')} onRetry={() => refetch()} />;

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
      {/* R6 — reported shorts: auto-hidden at 3 reports, restore or keep
          hidden from here. */}{' '}
      {isAuthenticated && (reportsQ.data ?? []).length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold">{t('admin.shorts.reported')}</h2>
          <div className="mt-3 space-y-3">
            {(reportsQ.data ?? []).map((r) => (
              <Card key={r.id} padding="lg">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-bold">
                      {locale === 'en'
                        ? ((r.titleJson as Record<string, string>)?.en ?? '')
                        : ((r.titleJson as Record<string, string>)?.ar ?? '')}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {t('admin.shorts.reports-count', { count: r.reportCount })}
                      {r.hidden ? ' · 🔒' : ''}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {(r.reasons as string[]).join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reportsMut.mutate({ shortId: r.id, approve: false })}
                      loading={reportsMut.isPending}
                    >
                      {t('admin.packages.reject')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => reportsMut.mutate({ shortId: r.id, approve: true })}
                      loading={reportsMut.isPending}
                    >
                      {t('admin.shorts.restore')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      {/* P4 — watch analytics (Phase 2): 30-day top reels by watch time. */}
      {isAuthenticated && (watchQ.data ?? []).length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold">{t('admin.shorts.watchStats')}</h2>
          <div className="mt-3 space-y-2">
            {(watchQ.data ?? []).map((w) => (
              <Card key={w.id} padding="md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {locale === 'en'
                        ? ((w.titleJson as Record<string, string>)?.en ?? '')
                        : ((w.titleJson as Record<string, string>)?.ar ?? '')}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {t('admin.shorts.watchSeconds', {
                        seconds: Math.round((w.watchSeconds as number) / 60),
                      })}{' '}
                      · {t('admin.shorts.watchEvents', { count: w.events as number })} ·{' '}
                      {t('admin.shorts.completionRate', {
                        rate: Math.round((w.completionRate as number) * 100),
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
