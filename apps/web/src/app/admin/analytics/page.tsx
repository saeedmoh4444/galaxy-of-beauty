'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, formatCurrency } from '@galaxy/shared';

function StatCard({ title, value, color }: { title: string; value: string; color: string }): JSX.Element {
  return (
    <Card className="text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}

export default function AdminAnalyticsPage(): JSX.Element {
  const revenueQuery = api.analytics.revenueChart.useQuery({ days: 30 } as never);
  const bookingStatsQuery = api.analytics.bookingStats.useQuery({} as never);
  const topTechQuery = api.analytics.topTechnicians.useQuery({ limit: 10 } as never);
  const userGrowthQuery = api.analytics.userGrowth.useQuery({ days: 30 } as never);

  const revenueData = (revenueQuery.data as unknown as Record<string, unknown>[]) ?? [];
  const bookingStats = bookingStatsQuery.data as Record<string, unknown>;
  const topTechs = (topTechQuery.data as unknown as Record<string, unknown>[]) ?? [];
  const userGrowth = (userGrowthQuery.data as unknown as Record<string, unknown>[]) ?? [];

  const maxRevenue = Math.max(...revenueData.map((r) => Number(r.amount ?? 0)), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الإحصائيات</h1>

      {/* Booking Stats */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">إحصائيات الحجوزات</h2>
        {bookingStatsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}</div>
        ) : bookingStatsQuery.isError ? (
          <ErrorAlert message="فشل تحميل إحصائيات الحجوزات" onRetry={() => bookingStatsQuery.refetch()} />
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="إجمالي الحجوزات" value={String(bookingStats?.total ?? 0)} color="text-brand-600" />
            <StatCard title="مكتملة" value={String((bookingStats?.byStatus as Record<string, number>)?.COMPLETED ?? 0)} color="text-green-600" />
            <StatCard title="قيد الانتظار" value={String((bookingStats?.byStatus as Record<string, number>)?.REQUESTED ?? 0)} color="text-amber-600" />
            <StatCard title="ملغية" value={String((bookingStats?.byStatus as Record<string, number>)?.CANCELLED ?? 0)} color="text-red-600" />
          </div>
        )}
      </div>

      {/* Revenue Chart */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">الإيرادات (آخر 30 يوم)</h2>
        {revenueQuery.isLoading ? (
          <CardSkeleton />
        ) : revenueQuery.isError ? (
          <ErrorAlert message="فشل تحميل الإيرادات" onRetry={() => revenueQuery.refetch()} />
        ) : revenueData.length === 0 ? (
          <EmptyState title="لا توجد بيانات إيرادات" />
        ) : (
          <div className="flex items-end gap-1" style={{ height: 200 }}>
            {revenueData.map((r: Record<string, unknown>, i: number) => {
              const amount = Number(r.amount ?? 0);
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
                    title={`${r.date as string ?? ''}: ${formatCurrency(amount)}`}
                  />
                  <span className="mt-1 text-[10px] text-gray-400">
                    {r.label as string ?? (r.date as string)?.slice(5, 10) ?? ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Top Technicians */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">أفضل الفنيات</h2>
        {topTechQuery.isLoading ? (
          <CardSkeleton />
        ) : topTechQuery.isError ? (
          <ErrorAlert message="فشل تحميل أفضل الفنيات" onRetry={() => topTechQuery.refetch()} />
        ) : topTechs.length === 0 ? (
          <EmptyState title="لا توجد فنيات" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-right dark:border-gray-800">
                  <th className="pb-2 font-medium text-gray-500">الاسم</th>
                  <th className="pb-2 font-medium text-gray-500">الحجوزات المكتملة</th>
                  <th className="pb-2 font-medium text-gray-500">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {topTechs.map((t: Record<string, unknown>, i: number) => (
                  <tr key={t.id as number ?? i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 font-medium">{t.name as string}</td>
                    <td className="py-2">{String(t.completedBookings ?? 0)}</td>
                    <td className="py-2">⭐ {Number(t.ratingAvg ?? 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Growth */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">نمو المستخدمين (آخر 30 يوم)</h2>
        {userGrowthQuery.isLoading ? (
          <CardSkeleton />
        ) : userGrowthQuery.isError ? (
          <ErrorAlert message="فشل تحميل نمو المستخدمين" onRetry={() => userGrowthQuery.refetch()} />
        ) : userGrowth.length === 0 ? (
          <EmptyState title="لا توجد بيانات نمو" />
        ) : (
          <div className="space-y-1">
            {userGrowth.map((u: Record<string, unknown>, i: number) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-1 text-sm dark:border-gray-800">
                <span>{u.date as string ?? '—'}</span>
                <span className="font-medium text-brand-600">+{String(u.count ?? 0)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
