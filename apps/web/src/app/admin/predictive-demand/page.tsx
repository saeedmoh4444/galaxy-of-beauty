'use client';
import { api } from '@/lib/trpc';
import { Card, KPIRowSkeleton, CardListSkeleton } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function PredictiveDemandPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading } = api.predictiveDemand.forecast.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
  };
  const f = data ?? {};

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.predictive-demand.title')}</h1>
      </div>
      {isLoading ? (
        <>
          <KPIRowSkeleton count={2} />
          <CardListSkeleton count={3} />
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="lg">
              <h3 className="font-bold mb-3">{t('admin.predictive-demand.next-week')}</h3>
              <p className="text-2xl font-extrabold">
                {t('admin.predictive-demand.bookings-count', {
                  count: (f.nextWeek as Record<string, unknown>)?.predictedBookings as number,
                })}
              </p>
              <p className="text-sm text-text-secondary">
                {t('admin.predictive-demand.peak', {
                  peak: `${(f.nextWeek as Record<string, unknown>)?.peakDay as string} ${(f.nextWeek as Record<string, unknown>)?.peakTime as string}`,
                })}
              </p>
              <p className="text-xs text-text-tertiary mt-2">
                {(f.nextWeek as Record<string, unknown>)?.recommendations
                  ? ((f.nextWeek as Record<string, unknown>)?.recommendations as string[])?.join(
                      ' · ',
                    )
                  : ''}
              </p>
            </Card>
            <Card padding="lg">
              <h3 className="font-bold mb-3">{t('admin.predictive-demand.next-month')}</h3>
              <p className="text-2xl font-extrabold">
                {t('admin.predictive-demand.bookings-count', {
                  count: (f.nextMonth as Record<string, unknown>)?.predictedBookings as number,
                })}
              </p>
              <p className="text-sm text-text-secondary">
                {t('admin.predictive-demand.confidence-growth', {
                  confidence: (f.nextMonth as Record<string, unknown>)?.confidence as number,
                  growth: (f.nextMonth as Record<string, unknown>)?.growth as number,
                })}
              </p>
            </Card>
          </div>
          <Card padding="lg">
            <h3 className="font-bold mb-3">{t('admin.predictive-demand.by-service')}</h3>
            <div className="space-y-2">
              {(f.byService as Array<Record<string, unknown>>)?.map(
                (s: Record<string, unknown>, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-surface-muted dark:bg-gray-800 p-3"
                  >
                    <span className="font-bold">{s.name as string}</span>
                    <span>
                      {t('admin.predictive-demand.demand', {
                        demand: s.currentDemand as number,
                      })}
                    </span>
                    <span
                      className={
                        s.trend === 'up'
                          ? 'text-green-600'
                          : s.trend === 'down'
                            ? 'text-red-600'
                            : 'text-text-secondary'
                      }
                    >
                      {s.prediction as string}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
