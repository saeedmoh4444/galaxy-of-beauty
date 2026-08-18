'use client';

import { api } from '@/lib/trpc';
import { Card, DashboardSkeleton, ErrorAlert, EmptyState, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';

export default function BeautyAnalyticsPage(): JSX.Element {
  const { t } = useLocale();
  const {
    data: summary,
    isLoading: sLoad,
    isError: sErr,
    refetch: sRef,
  } = api.beautyAnalytics.summary.useQuery() as {
    data:
      | {
          totalBookings: number;
          completedBookings: number;
          completionRate: number;
          totalSpent: number;
          recentCredits: Array<{ amount: number; source: string; date: string }>;
        }
      | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: byCat, isLoading: cLoad } = api.beautyAnalytics.byCategory.useQuery() as {
    data: Array<{ category: string; count: number; spent: number; pct: number }> | undefined;
    isLoading: boolean;
  };
  const { data: trend, isLoading: tLoad } = api.beautyAnalytics.monthlyTrend.useQuery() as {
    data: Array<{ month: string; count: number }> | undefined;
    isLoading: boolean;
  };

  const isLoading = sLoad || cLoad || tLoad;
  const isError = sErr;
  const s = summary ?? {
    totalBookings: 0,
    completedBookings: 0,
    completionRate: 0,
    totalSpent: 0,
    recentCredits: [],
  };
  const categories = byCat ?? [];
  const monthlyTrend = trend ?? [];
  const maxMonthly = Math.max(1, ...monthlyTrend.map((m) => m.count));

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
            {t('beautyAnalytics.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
            {t('beautyAnalytics.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <ErrorAlert message={t('beautyAnalytics.err.load')} onRetry={() => sRef()} />
        ) : s.totalBookings === 0 ? (
          <EmptyState
            title={t('beautyAnalytics.noData')}
            description={t('beautyAnalytics.empty.desc')}
            action={{
              label: t('beautyAnalytics.empty.action'),
              onPress: () => window.location.assign('/bookings/create'),
            }}
          />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card padding="lg" className="text-center">
                <p className="text-4xl"></p>
                <p className="mt-2 text-3xl font-extrabold text-brand-600">{s.totalBookings}</p>
                <p className="text-xs text-text-secondary">
                  {t('beautyAnalytics.kpi.totalBookings')}
                </p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-4xl"></p>
                <p className="mt-2 text-3xl font-extrabold text-green-600">{s.completedBookings}</p>
                <p className="text-xs text-text-secondary">{t('beautyAnalytics.kpi.completed')}</p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-4xl"></p>
                <p className="mt-2 text-3xl font-extrabold text-blue-600">{s.completionRate}%</p>
                <p className="text-xs text-text-secondary">
                  {t('beautyAnalytics.kpi.completionRate')}
                </p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-4xl"></p>
                <p className="mt-2 text-3xl font-extrabold text-purple-600">
                  {formatCurrency(s.totalSpent)}
                </p>
                <p className="text-xs text-text-secondary">{t('beautyAnalytics.kpi.totalSpent')}</p>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card padding="lg">
              <h3 className="font-bold text-lg mb-4">{t('beautyAnalytics.byCategoryTitle')}</h3>
              {categories.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-4">
                  {t('beautyAnalytics.noData')}
                </p>
              ) : (
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-text-primary dark:text-gray-300">
                          {cat.category}
                        </span>
                        <span className="text-text-secondary">
                          {t('beautyAnalytics.bookingsSpent', {
                            count: cat.count,
                            amount: formatCurrency(cat.spent),
                          })}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-surface-muted dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-purple-500 transition-all"
                          style={{ width: `${cat.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Monthly Trend */}
            <Card padding="lg">
              <h3 className="font-bold text-lg mb-4">{t('beautyAnalytics.monthlyTitle')}</h3>
              {monthlyTrend.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-4">
                  {t('beautyAnalytics.noData')}
                </p>
              ) : (
                <div className="flex items-end gap-2 h-32">
                  {monthlyTrend.map((m) => {
                    const height = Math.max(8, (m.count / maxMonthly) * 100);
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-text-secondary dark:text-gray-400">
                          {m.count}
                        </span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-brand-400 to-purple-400 transition-all"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] text-text-tertiary">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Recent Credits */}
            {s.recentCredits.length > 0 && (
              <Card padding="lg">
                <h3 className="font-bold text-lg mb-4">{t('beautyAnalytics.creditsTitle')}</h3>
                <div className="space-y-2">
                  {s.recentCredits.map((c, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-text-secondary">
                        {c.source === 'REFERRAL_BONUS'
                          ? t('beautyAnalytics.source.referral')
                          : c.source === 'CASHBACK'
                            ? t('beautyAnalytics.source.cashback')
                            : c.source}
                      </span>
                      <span className="font-bold text-green-600">+{formatCurrency(c.amount)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* CTA */}
            <div className="text-center">
              <Link href="/bookings/create">
                <span className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 transition-colors">
                  {t('beautyAnalytics.bookNext')}
                </span>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
