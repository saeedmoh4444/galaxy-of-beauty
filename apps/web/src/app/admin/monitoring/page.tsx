'use client';
import { api } from '@/lib/trpc';
import { Card, KPIRowSkeleton, ErrorAlert, EmptyState, PageContainer, StatCard } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { type TranslationKey } from '@galaxy/shared';

const STATUS_COLORS: Record<string, string> = {
  healthy: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
  warning: 'text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300',
  error: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
  unknown: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
};

const SERVICE_LABEL_KEYS: Record<string, TranslationKey> = {
  database: 'admin.monitoring.svc-database',
  redis: 'admin.monitoring.svc-redis',
  api: 'admin.monitoring.svc-api',
  socket: 'admin.monitoring.svc-socket',
  payments: 'admin.monitoring.svc-payments',
};

export default function MonitoringPage(): JSX.Element {
  const { t, locale } = useLocale();
  const {
    data: health,
    isLoading,
    isError,
    refetch,
  } = api.monitoring.health.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: errors } = api.monitoring.errorsFeed.useQuery() as {
    data: Record<string, unknown> | undefined;
  };

  const h = health ?? {};
  const services = (h.services ?? {}) as Record<string, Record<string, unknown>>;
  const perf = (h.performance ?? {}) as Record<string, unknown>;
  const activity = (h.activity ?? {}) as Record<string, unknown>;
  const today = (activity.today ?? {}) as Record<string, number>;
  const errData = (h.errors ?? {}) as Record<string, unknown>;
  const recentErrors = (errors?.recent ?? []) as Array<Record<string, unknown>>;

  return (
    <PageContainer width="wide">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.monitoring.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('admin.monitoring.subtitle', { uptime: (h.uptime as string) ?? '...' })}
          </p>
        </div>

        {isLoading ? (
          <KPIRowSkeleton count={5} />
        ) : isError ? (
          <ErrorAlert message={t('admin.monitoring.load-error')} onRetry={() => refetch()} />
        ) : !health ? (
          <EmptyState
            title={t('admin.monitoring.empty')}
            description={t('admin.monitoring.empty-desc')}
          />
        ) : (
          <>
            {/* ── Service Status Cards ── */}
            <div className="grid gap-4 sm:grid-cols-5">
              {Object.entries(services).map(([key, svc]) => (
                <Card key={key} padding="lg" className="text-center">
                  <span
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-full text-lg ${STATUS_COLORS[(svc.status as string) ?? 'unknown']}`}
                  >
                    {svc.status === 'healthy' ? '' : svc.status === 'warning' ? '' : ''}
                  </span>
                  <p className="font-bold text-sm mt-2">
                    {t(SERVICE_LABEL_KEYS[key] ?? (key as unknown as TranslationKey))}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">{svc.latency as string}</p>
                  {/* Extra detail per service */}
                  {key === 'database' && svc.connections !== undefined && (
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      {t('admin.monitoring.connections', {
                        count: svc.connections as number,
                        max: svc.maxConnections as number,
                      })}
                    </p>
                  )}
                  {key === 'redis' &&
                    svc.memoryUsed !== undefined &&
                    svc.memoryUsed !== 'unavailable' && (
                      <p className="text-[10px] text-text-tertiary mt-0.5">
                        {svc.memoryUsed as string} / {svc.memoryTotal as string}
                      </p>
                    )}
                  {key === 'api' && svc.requestsPerMinute !== undefined && (
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      {t('admin.monitoring.requests-per-minute', {
                        req: svc.requestsPerMinute as number,
                      })}
                    </p>
                  )}
                  {key === 'payments' && svc.successRate !== undefined && (
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      {t('admin.monitoring.success-rate', { rate: svc.successRate as number })}
                    </p>
                  )}
                </Card>
              ))}
            </div>

            {/* ── Real-time Stats Row ── */}
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard
                label={t('admin.monitoring.bookings-today')}
                value={today.bookings ?? 0}
                icon=""
              />
              <StatCard
                label={t('admin.monitoring.logins-today')}
                value={today.logins ?? 0}
                icon=""
              />
              <StatCard
                label={t('admin.monitoring.payments-today')}
                value={today.payments ?? 0}
                icon=""
              />
              <StatCard
                label={t('admin.monitoring.error-rate')}
                value={`${(errData.apiErrorsToday as number) ?? 0}`}
                icon=""
              />
            </div>

            {/* ── Performance ── */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="lg" className="text-center">
                <p className="text-3xl"></p>
                <p className="text-2xl font-bold">{perf.avgResponseTime as string}</p>
                <p className="text-xs text-text-secondary">{t('admin.monitoring.avg-response')}</p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-3xl"></p>
                <p className="text-2xl font-bold">{perf.p95ResponseTime as string}</p>
                <p className="text-xs text-text-secondary">p95</p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-3xl"></p>
                <p className="text-2xl font-bold">{perf.p99ResponseTime as string}</p>
                <p className="text-xs text-text-secondary">p99</p>
              </Card>
            </div>

            {/* ── Errors + Recent Feed ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card padding="lg">
                <h3 className="font-bold mb-3">
                  {t('admin.monitoring.errors-title', {
                    count: (errData.last24h as number) ?? 0,
                  })}
                </h3>
                <div className="space-y-2">
                  {(errData.byType as Array<Record<string, unknown>>)?.map(
                    (e: Record<string, unknown>, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-sm w-32">{e.type as string}</span>
                        <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-3 rounded-full bg-red-500"
                            style={{ width: `${e.pct as number}%` }}
                          />
                        </div>
                        <span className="text-xs w-10">{e.count as number}</span>
                      </div>
                    ),
                  )}
                  {(!errData.byType || (errData.byType as unknown[]).length === 0) && (
                    <p className="text-sm text-text-secondary">{t('admin.monitoring.no-errors')}</p>
                  )}
                </div>
              </Card>
              <Card padding="lg">
                <h3 className="font-bold mb-3">{t('admin.monitoring.recent-feed')}</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentErrors.map((e: Record<string, unknown>, i: number) => (
                    <div
                      key={i}
                      className={`rounded-lg p-2 text-xs ${
                        (e.level as string) === 'error'
                          ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                          : (e.level as string) === 'warning'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {e.message as string}
                      <span className="block text-text-tertiary mt-0.5">
                        {new Date(e.timestamp as string).toLocaleTimeString(
                          locale === 'en' ? 'en-GB' : 'ar-SA',
                        )}
                      </span>
                    </div>
                  ))}
                  {recentErrors.length === 0 && (
                    <p className="text-sm text-text-secondary">
                      {t('admin.monitoring.no-recent-events')}
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* ── Activity Chart (7-day bookings) ── */}
            <Card padding="lg">
              <h3 className="font-bold mb-4">{t('admin.monitoring.daily-activity')}</h3>
              {(activity.chart as number[])?.length > 0 ? (
                <div className="flex items-end gap-1 h-24">
                  {(activity.chart as number[]).map((v: number, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-brand-400 to-brand-600"
                        style={{
                          height: `${Math.max(4, ((v || 1) / Math.max(...(activity.chart as number[]), 1)) * 100)}%`,
                        }}
                      />
                      <span className="text-[8px] text-text-tertiary">{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  {t('admin.monitoring.insufficient-data')}
                </p>
              )}
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}
