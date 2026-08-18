'use client';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, DashboardSkeleton, Button, formatCurrency, ErrorAlert } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyDashboardPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading, isError, refetch } = api.beautyDashboard.overview.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isError)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-4xl space-y-6">
          <ErrorAlert message={t('beautyDashboard.err.load')} onRetry={() => refetch()} />
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('beautyDashboard.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('beautyDashboard.subtitle')}</p>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              <Card padding="lg" className="text-center">
                <p className="text-2xl font-extrabold text-brand-600">
                  {(data?.upcomingBookings as number) ?? 0}
                </p>
                <p className="text-xs text-text-secondary">{t('beautyDashboard.upcoming')}</p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-2xl font-extrabold text-green-600">
                  {(data?.completedBookings as number) ?? 0}
                </p>
                <p className="text-xs text-text-secondary">{t('referrals.stat.completed')}</p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-2xl font-extrabold text-amber-600">
                  {(data?.streakDays as number) ?? 0}
                </p>
                <p className="text-xs text-text-secondary">{t('beautyDashboard.streakDays')}</p>
              </Card>
              <Card padding="lg" className="text-center">
                <p className="text-2xl font-extrabold text-purple-600">
                  {formatCurrency((data?.walletBalance as number) ?? 0)}
                </p>
                <p className="text-xs text-text-secondary">{t('beautyDashboard.wallet')}</p>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card padding="lg">
                <h3 className="font-bold mb-3">{t('beautyDashboard.recentBookings')}</h3>
                {(data?.recentBookings as Array<Record<string, unknown>>)?.length ? (
                  (data?.recentBookings as Array<Record<string, unknown>>).map(
                    (b: Record<string, unknown>) => (
                      <div
                        key={b.id as number}
                        className="flex items-center justify-between border-b py-2 text-sm"
                      >
                        <span>{b.serviceName as string}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}
                        >
                          {b.status as string}
                        </span>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-sm text-text-tertiary">{t('beautyDashboard.noBookings')}</p>
                )}
                <Link href="/bookings">
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    {t('beautyDashboard.allBookings')}
                  </Button>
                </Link>
              </Card>

              <Card padding="lg">
                <h3 className="font-bold mb-3">{t('beautyDashboard.skinOverview')}</h3>
                {data?.skinType ? (
                  <div className="space-y-3">
                    <p className="text-sm">
                      <span className="text-text-secondary">{t('wellnessHub.skinTypeLabel')}</span>{' '}
                      <span className="font-bold">{data.skinType as string}</span>
                    </p>
                    {(data?.skinConcerns as string[])?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(data.skinConcerns as string[]).map((c: string) => (
                          <span
                            key={c}
                            className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link href="/skin-analysis">
                      <Button size="sm" variant="outline" className="w-full mt-2">
                        {t('wellnessHub.action.skin')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-text-tertiary">
                      {t('beautyDashboard.noSkinAnalysis')}
                    </p>
                    <Link href="/skin-analysis">
                      <Button size="sm" className="w-full mt-3">
                        {t('wellnessHub.skinCta')}
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/beauty-journal">
                <Card hover padding="md" className="text-center">
                  <span className="text-3xl"></span>
                  <p className="font-bold mt-2">{(data?.journalCount as number) ?? 0}</p>
                  <p className="text-xs text-text-secondary">{t('beautyDashboard.journal')}</p>
                </Card>
              </Link>
              <Link href="/wishlist">
                <Card hover padding="md" className="text-center">
                  <span className="text-3xl">️</span>
                  <p className="font-bold mt-2">{(data?.wishlistCount as number) ?? 0}</p>
                  <p className="text-xs text-text-secondary">{t('beautyDashboard.wishlist')}</p>
                </Card>
              </Link>
              <Link href="/wallet">
                <Card hover padding="md" className="text-center">
                  <span className="text-3xl"></span>
                  <p className="font-bold mt-2">
                    {formatCurrency((data?.bonusBalance as number) ?? 0)}
                  </p>
                  <p className="text-xs text-text-secondary">{t('beautyDashboard.bonus')}</p>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
