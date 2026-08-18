'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, formatCurrency, ErrorAlert } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function TrendingPage(): JSX.Element {
  const { t } = useLocale();
  const {
    data: trending,
    isLoading: trLoading,
    isError: trError,
    refetch: trRefetch,
  } = api.social.trending.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: spotlight, isLoading: spLoading } = api.social.spotlight.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };

  if (trError)
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ErrorAlert message={t('marketing.trending.load-error')} onRetry={() => trRefetch()} />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t('marketing.trending.title')}</h1>
        <p className="mt-2 text-text-secondary">{t('marketing.trending.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <h3 className="font-bold mb-3 text-lg">{t('marketing.trending.top-services')}</h3>
          {trLoading ? (
            <CardListSkeleton count={4} />
          ) : !(trending ?? []).length ? (
            <p className="text-sm text-text-tertiary">{t('marketing.trending.no-data')}</p>
          ) : (
            <div className="space-y-2">
              {(trending ?? []).slice(0, 10).map((s: Record<string, unknown>) => (
                <div
                  key={s.serviceId as number}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-bold text-sm">
                      {(s.titleJson as Record<string, string>)?.ar ??
                        t('marketing.trending.service-fallback', { id: s.serviceId as number })}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatCurrency(Number(s.basePrice ?? 0))}
                    </p>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    {t('marketing.trending.bookings-count', { count: s.bookingCount as number })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="lg">
          <h3 className="font-bold mb-3 text-lg">
            {t('marketing.trending.spotlight-technicians')}
          </h3>
          {spLoading ? (
            <CardListSkeleton count={4} />
          ) : !(spotlight ?? []).length ? (
            <p className="text-sm text-text-tertiary">{t('marketing.trending.no-data')}</p>
          ) : (
            <div className="space-y-3">
              {(spotlight ?? []).map((t: Record<string, unknown>) => (
                <div key={t.id as number} className="flex items-center gap-4 rounded-lg border p-3">
                  <span className="text-4xl">‍</span>
                  <div>
                    <p className="font-bold">{t.name as string}</p>
                    <p className="text-xs text-text-secondary">
                      {t.city as string} · {t.ratingAvg as number}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
