'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ComponentProps } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  CardSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  formatCurrency,
  StatCard,
  PageContainer,
  Icon,
  DashboardSkeleton,
  CardListSkeleton,
  DailyBeautyTipCard,
  KindnessPointsBadge,
  SisterhoodWall,
  SelfCareReminder,
  BeautyBudgetCard,
  BeautyCircleCard,
  BeautySavingsGoal,
  useAuth,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RebookReminder } from '@/components/RebookReminder';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function CustomerDashboardPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const bookings = api.bookings.list.useQuery({ limit: 3 });
  const insights = api.analytics.customerInsights.useQuery();
  const budget = api.beautyBudget.get.useQuery();
  const pins = api.inspiration.list.useQuery();
  const registries = api.giftRegistry.myRegistries.useQuery();
  // New wired components — kindness gated on the real session (an
  // expired cookie still passes the middleware and would error-banner).
  const kindnessStatus = api.kindnessPoints.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const circles = api.beautyCircles.list.useQuery({ limit: 3 });
  const savingsGoals = api.savingsGoals.list.useQuery();
  // Budget services under 100 SAR
  const budgetServices = api.services.list.useQuery({
    limit: 5,
    maxPrice: 100,
  });

  const streakInfo = insights.data?.streakInfo;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.title')}</h1>
          <RebookReminder />
          <Link href="/self-care">
            <Button variant="outline" size="sm">
              <Icon name="sparkle" size="sm" />
              {t('dashboard.daily-assessment')}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        {insights.isLoading ? (
          <DashboardSkeleton />
        ) : insights.isError ? (
          <ErrorAlert message={t('dashboard.stats-error')} onRetry={() => insights.refetch()} />
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label={t('dashboard.bookings')}
              value={insights.data?.bookingCount ?? 0}
              icon=""
            />
            <StatCard
              label={t('dashboard.spending')}
              value={formatCurrency(Number(insights.data?.totalSpent ?? 0))}
              icon=""
            />
            <StatCard
              label={t('dashboard.continuity')}
              value={` ${streakInfo?.currentStreak ?? 0} ${t('dashboard.weeks')}`}
              icon=""
            />
            {budget?.data ? (
              <StatCard
                label={t('dashboard.budget')}
                value={formatCurrency(Number(budget.data.remaining))}
                icon=""
              />
            ) : (
              <CardSkeleton />
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/bookings/create">
            <Button size="lg">
              <Icon name="sparkle" size="sm" />
              {t('button.bookNow')}
            </Button>
          </Link>
          <Link href="/gift-cards">
            <Button variant="outline">
              <Icon name="gift" size="sm" />
              {t('dashboard.gift-cards')}
            </Button>
          </Link>
          <Link href="/inspiration">
            <Button variant="outline">
              <Icon name="bookmark" size="sm" />
              {t('dashboard.inspiration-board')}
            </Button>
          </Link>
          <Link href="/services/surprise-me">
            <Button variant="outline">
              <Icon name="sparkle" size="sm" />
              {t('dashboard.surprise-me')}
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Bookings */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {t('dashboard.recent-bookings')}
              </h2>
              <Link href="/bookings" className="text-xs text-brand-600 hover:underline">
                {t('action.viewAll')}
              </Link>
            </div>
            {bookings.isLoading ? (
              <CardListSkeleton count={3} />
            ) : bookings.isError ? (
              <ErrorAlert message={t('dashboard.load-error')} onRetry={() => bookings.refetch()} />
            ) : !bookings.data?.bookings || (bookings.data.bookings as unknown[]).length === 0 ? (
              <EmptyState
                title={t('dashboard.no-bookings')}
                description={t('dashboard.start-journey')}
              />
            ) : (
              <div className="space-y-2">
                {(bookings.data.bookings as unknown as Record<string, unknown>[])
                  .slice(0, 3)
                  .map((b: Record<string, unknown>) => (
                    <Card key={b.id as number} padding="sm" hover>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-text-primary">
                            {b.bookingCode as string}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {new Date(b.startAt as string).toLocaleDateString(
                              locale === 'en' ? 'en-GB' : 'ar-SA',
                            )}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            b.status === 'COMPLETED'
                              ? 'bg-success-subtle text-success'
                              : b.status === 'CANCELLED'
                                ? 'bg-danger-subtle text-danger'
                                : 'bg-info-subtle text-info'
                          }`}
                        >
                          {b.status as string}
                        </span>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>

          {/* Inspiration + Registry */}
          <div className="space-y-4">
            {pins?.data?.length ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {t('dashboard.inspiration-board')}
                  </h2>
                  <Link href="/inspiration" className="text-xs text-brand-600 hover:underline">
                    {t('action.viewAll')}
                  </Link>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {pins.data.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted dark:bg-gray-800"
                    >
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt="" fill className="object-cover" />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center text-2xl"
                          aria-hidden="true"
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {registries?.data?.length ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {t('dashboard.gift-registry')}
                  </h2>
                  <Link href="/gift-registry" className="text-xs text-brand-600 hover:underline">
                    {t('action.viewAll')}
                  </Link>
                </div>
                {registries.data.slice(0, 2).map((r) => {
                  const pct =
                    Number(r.targetAmount) > 0
                      ? Math.min(100, (Number(r.raisedAmount) / Number(r.targetAmount)) * 100)
                      : 0;
                  return (
                    <Card key={r.id} padding="sm" className="mb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-text-primary">{r.title}</p>
                          <p className="text-xs text-text-secondary">
                            {formatCurrency(Number(r.raisedAmount))} /{' '}
                            {formatCurrency(Number(r.targetAmount))}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-brand-600">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-surface-muted dark:bg-gray-700">
                        <div
                          className="h-1.5 rounded-full bg-brand-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Community + Wellness row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <SelfCareReminder />
          {budget?.data && (
            <BeautyBudgetCard
              services={
                budgetServices?.data?.items?.slice(0, 4)?.map((s) => ({
                  name: localize(s.titleJson, locale),
                  price: Number(s.basePrice),
                  category: 'facial' as const,
                  duration: `${s.durationMin} ${t('misc.min')}`,
                })) ?? []
              }
            />
          )}
          <DailyBeautyTipCard />
        </div>

        {/* Sisterhood + Circles row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SisterhoodWall />
          {circles?.data?.items?.length ? (
            <BeautyCircleCard
              circle={{
                name: circles.data.items[0]?.name ?? t('dashboard.beauty-circle'),
                topic: (circles.data.items[0]?.topic ?? 'skincare') as ComponentProps<
                  typeof BeautyCircleCard
                >['circle']['topic'],
                members: circles.data.items[0]?.members ?? 0,
                cover: circles.data.items[0]?.cover ?? '',
              }}
            />
          ) : null}
        </div>

        {/* Kindness + Savings row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <KindnessPointsBadge points={kindnessStatus?.data?.points ?? 0} />
          {savingsGoals?.data?.length ? (
            <BeautySavingsGoal
              goals={(savingsGoals.data as Array<Record<string, unknown>>).slice(0, 2).map((g) => ({
                label: (g.name as string) ?? t('dashboard.savings-goal'),
                target: (g.amount as number) ?? 0,
                saved: (g.saved as number) ?? 0,
                monthly: (g.monthly as number) ?? 0,
                emoji: (g.emoji as string) ?? '',
              }))}
            />
          ) : null}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
