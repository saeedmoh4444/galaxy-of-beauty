'use client';
import { api } from '@/lib/trpc';
import { Card, KPIRowSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function BookingInsightsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: insights, isLoading } = api.analytics.customerInsights.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('bookingInsights.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('bookingInsights.subtitle')}</p>
        </div>

        {isLoading ? (
          <KPIRowSkeleton count={3} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="lg" className="text-center">
                <p className="text-2xl font-extrabold">
                  {(insights?.totalBookings as number) ?? 0}
                </p>
                <p className="text-xs text-text-secondary">{t('bookingInsights.totalBookings')}</p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-2xl font-extrabold text-green-600">
                  {formatCurrency(Number(insights?.totalSpent ?? 0))}
                </p>
                <p className="text-xs text-text-secondary">{t('bookingInsights.totalSpent')}</p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-2xl font-extrabold text-purple-600">
                  {insights?.avgPerBooking ? formatCurrency(Number(insights?.avgPerBooking)) : '—'}
                </p>
                <p className="text-xs text-text-secondary">{t('bookingInsights.avgBooking')}</p>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card padding="lg" className="text-center">
                <p className="text-sm text-text-secondary">{t('bookingInsights.streak')}</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-1">
                  {((insights?.streak as Record<string, unknown>)?.currentStreak as number) ?? 0}
                </p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-sm text-text-secondary">{t('bookingInsights.favCategory')}</p>
                <p className="text-xl font-bold text-brand-600 mt-1">
                  {insights?.favoriteCategory
                    ? localize(insights?.favoriteCategoryName, locale)
                    : '—'}
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  {t('beautyExpenses.bookingCount', {
                    count: (insights?.favoriteCategoryCount as number) ?? 0,
                  })}
                </p>
              </Card>
            </div>

            <Card padding="lg">
              <h3 className="font-bold mb-3">{t('bookingInsights.summary')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('bookingInsights.completed')}</span>
                  <span className="font-bold text-green-600">
                    {(insights?.completedBookings as number) ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('bookingInsights.cancelled')}</span>
                  <span className="font-bold text-red-500">
                    {(insights?.cancelledBookings as number) ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('bookingInsights.completionRate')}</span>
                  <span className="font-bold">{(insights?.completionRate as number) ?? 0}%</span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
