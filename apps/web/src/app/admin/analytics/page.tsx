'use client';

import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import {
  Card,
  KPIRowSkeleton,
  CardListSkeleton,
  ErrorAlert,
  EmptyState,
  formatCurrency,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type RevenueDay = NonNullable<RouterOutput['analytics']['revenueChart']>['dailyRevenue'][number];
type BookingStats = RouterOutput['analytics']['bookingStats'];
type TopTechnician = RouterOutput['analytics']['topTechnicians'][number];
type UserGrowthDay = NonNullable<RouterOutput['analytics']['userGrowth']>['dailyGrowth'][number];

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}): JSX.Element {
  return (
    <Card className="text-center">
      <p className="text-sm text-text-secondary">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}

export default function AdminAnalyticsPage(): JSX.Element {
  const { t } = useLocale();
  const revenueQuery = api.analytics.revenueChart.useQuery({ days: 30 });
  const bookingStatsQuery = api.analytics.bookingStats.useQuery();
  const topTechQuery = api.analytics.topTechnicians.useQuery({ limit: 10 });
  const userGrowthQuery = api.analytics.userGrowth.useQuery({ days: 30 });

  const revenueData = revenueQuery.data?.dailyRevenue ?? [];
  const bookingStats = bookingStatsQuery.data as BookingStats | undefined;
  const topTechs = topTechQuery.data ?? [];
  const userGrowth = userGrowthQuery.data?.dailyGrowth ?? [];

  const maxRevenue = Math.max(...revenueData.map((r) => Number(r.revenue ?? 0)), 1);

  const byStatusMap: Record<string, number> = {};
  if (bookingStats) {
    for (const entry of bookingStats.byStatus) {
      byStatusMap[entry.status] = entry.count;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.analytics.title')}</h1>

      {/* Booking Stats */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t('admin.analytics.booking-stats-title')}</h2>
        {bookingStatsQuery.isLoading ? (
          <KPIRowSkeleton count={4} />
        ) : bookingStatsQuery.isError ? (
          <ErrorAlert
            message={t('admin.analytics.booking-stats-error')}
            onRetry={() => bookingStatsQuery.refetch()}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title={t('admin.analytics.total-bookings')}
              value={String(bookingStats?.total ?? 0)}
              color="text-brand-600"
            />
            <StatCard
              title={t('admin.analytics.completed')}
              value={String(byStatusMap['COMPLETED'] ?? 0)}
              color="text-green-600"
            />
            <StatCard
              title={t('admin.analytics.pending')}
              value={String(byStatusMap['REQUESTED'] ?? 0)}
              color="text-amber-600"
            />
            <StatCard
              title={t('admin.analytics.cancelled')}
              value={String(byStatusMap['CANCELLED'] ?? 0)}
              color="text-red-600"
            />
          </div>
        )}
      </div>

      {/* Revenue Chart */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t('admin.analytics.revenue-title')}</h2>
        {revenueQuery.isLoading ? (
          <CardListSkeleton count={4} />
        ) : revenueQuery.isError ? (
          <ErrorAlert
            message={t('admin.analytics.revenue-error')}
            onRetry={() => revenueQuery.refetch()}
          />
        ) : revenueData.length === 0 ? (
          <EmptyState title={t('admin.analytics.revenue-empty')} />
        ) : (
          <div className="flex items-end gap-1" style={{ height: 200 }}>
            {revenueData.map((r: RevenueDay, i: number) => {
              const amount = Number(r.revenue ?? 0);
              const pct = (amount / maxRevenue) * 100;
              return (
                <div
                  key={i}
                  className="group relative flex flex-1 flex-col items-center"
                  style={{ height: '100%', justifyContent: 'flex-end' }}
                >
                  <div
                    className="w-full rounded-t bg-brand-500 transition-all hover:bg-brand-600"
                    style={{ height: `${Math.max(pct, 2)}%`, minHeight: 4 }}
                    title={`${r.date ?? ''}: ${formatCurrency(amount)}`}
                  />
                  <span className="mt-1 text-[10px] text-text-tertiary">
                    {r.date?.slice(5, 10) ?? ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Top Technicians */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t('admin.analytics.top-technicians')}</h2>
        {topTechQuery.isLoading ? (
          <CardListSkeleton count={4} />
        ) : topTechQuery.isError ? (
          <ErrorAlert
            message={t('admin.analytics.top-tech-error')}
            onRetry={() => topTechQuery.refetch()}
          />
        ) : topTechs.length === 0 ? (
          <EmptyState title={t('admin.analytics.no-technicians')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge text-right dark:border-gray-800">
                  <th className="pb-2 font-medium text-text-secondary">
                    {t('admin.analytics.name-header')}
                  </th>
                  <th className="pb-2 font-medium text-text-secondary">
                    {t('admin.analytics.completed-bookings-header')}
                  </th>
                  <th className="pb-2 font-medium text-text-secondary">
                    {t('admin.analytics.rating-header')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {topTechs.map((t: TopTechnician, i: number) => (
                  <tr key={t.id ?? i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 font-medium">{t.name}</td>
                    <td className="py-2">{String(t.completedBookings ?? 0)}</td>
                    <td className="py-2"> {Number(t.ratingAvg ?? 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Growth */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t('admin.analytics.user-growth-title')}</h2>
        {userGrowthQuery.isLoading ? (
          <CardListSkeleton count={4} />
        ) : userGrowthQuery.isError ? (
          <ErrorAlert
            message={t('admin.analytics.user-growth-error')}
            onRetry={() => userGrowthQuery.refetch()}
          />
        ) : userGrowth.length === 0 ? (
          <EmptyState title={t('admin.analytics.user-growth-empty')} />
        ) : (
          <div className="space-y-1">
            {userGrowth.map((u: UserGrowthDay, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-gray-100 pb-1 text-sm dark:border-gray-800"
              >
                <span>{u.date ?? '—'}</span>
                <span className="font-medium text-brand-600">+{String(u.total ?? 0)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
