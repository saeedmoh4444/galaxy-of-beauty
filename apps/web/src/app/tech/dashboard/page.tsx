'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import {
  Card,
  ErrorAlert,
  EmptyState,
  Button,
  formatCurrency,
  StatCard,
  PageContainer,
  DashboardSkeleton,
  CardListSkeleton,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function TechDashboardPage(): JSX.Element {
  const { t, locale } = useLocale();
  const pending = api.bookings.getTechnicianPending.useQuery();
  const earnings = api.analytics.technicianEarnings.useQuery({ days: 30 });
  const { data: profile } = api.auth.me.useQuery();
  const transition = api.bookings.transition.useMutation({
    onSuccess: () => {
      pending.refetch();
    },
  });

  // technicianEarnings returns { dailyEarnings, totalEarnings, ... } — the
  // today/week/month summaries below were never part of that shape, so the
  // KPIs show 0 until product decides the intended aggregation.
  const legacyEarnings = earnings.data as
    | (NonNullable<typeof earnings.data> & { today?: number; week?: number; month?: number })
    | undefined;
  const todayEarnings = legacyEarnings?.today || 0;
  const weekEarnings = legacyEarnings?.week || 0;
  const monthEarnings = legacyEarnings?.month || 0;
  const rating = profile?.technician?.ratingAvg || 0;
  const completedBookings = profile?.technician?.completedBookings || 0;

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <PageContainer width="wide">
        <h1 className="text-2xl font-bold text-text-primary">{t('tech.dashboard.title')}</h1>

        {/* Stats */}
        {earnings.isLoading ? (
          <DashboardSkeleton />
        ) : earnings.isError ? (
          <ErrorAlert message={t('tech.dashboard.load-error')} onRetry={() => earnings.refetch()} />
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label={t('tech.dashboard.earnings-today')}
              value={formatCurrency(Number(todayEarnings))}
              icon=""
            />
            <StatCard
              label={t('tech.dashboard.earnings-week')}
              value={formatCurrency(Number(weekEarnings))}
              icon=""
            />
            <StatCard
              label={t('tech.dashboard.earnings-month')}
              value={formatCurrency(Number(monthEarnings))}
              icon=""
            />
            <StatCard
              label={t('tech.dashboard.rating')}
              value={` ${Number(rating).toFixed(1)}`}
              icon=""
            />
          </div>
        )}

        {/* Performance Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label={t('tech.dashboard.completed-bookings')}
            value={completedBookings}
            icon=""
          />
          <StatCard
            label={t('tech.dashboard.customer-rating')}
            value={Number(rating).toFixed(1)}
            icon=""
          />
          <StatCard
            label={t('tech.dashboard.kyc-status')}
            value={
              profile?.technician?.kycStatus === 'VERIFIED'
                ? t('tech.dashboard.kyc-verified')
                : t('tech.dashboard.kyc-under-review')
            }
            icon=""
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/tech/slots">
            <Button variant="outline">{t('tech.dashboard.manage-slots')}</Button>
          </Link>
          <Link href="/tech/profile">
            <Button variant="outline">{t('tech.dashboard.edit-profile')}</Button>
          </Link>
          <Link href="/tech/earnings">
            <Button variant="outline">{t('tech.dashboard.earnings')}</Button>
          </Link>
          <Link href="/tech/calendar">
            <Button variant="outline">{t('tech.dashboard.calendar')}</Button>
          </Link>
        </div>

        {/* Pending Bookings */}
        <h2 className="text-lg font-semibold text-text-primary">
          {t('tech.dashboard.pending-title')}
        </h2>
        {pending.isLoading ? (
          <CardListSkeleton count={3} />
        ) : pending.isError ? (
          <ErrorAlert message={t('tech.dashboard.load-error')} onRetry={() => pending.refetch()} />
        ) : !pending.data || (pending.data as unknown[]).length === 0 ? (
          <EmptyState title={t('tech.dashboard.pending-empty')} />
        ) : (
          <div className="space-y-3">
            {(pending.data ?? []).slice(0, 10).map((b) => (
              <Card key={b.id} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{b.bookingCode}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(b.startAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA')}{' '}
                      · {formatCurrency(Number(b.totalAmount))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => transition.mutate({ id: b.id as number, action: 'accept' })}
                      loading={transition.isPending}
                    >
                      {t('tech.bookings.accept')}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => transition.mutate({ id: b.id as number, action: 'reject' })}
                      loading={transition.isPending}
                    >
                      {t('tech.bookings.reject')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
