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
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RebookReminder } from '@/components/RebookReminder';

export default function CustomerDashboardPage(): JSX.Element {
  const bookings = api.bookings.list.useQuery({ limit: 3 });
  const insights = api.analytics.customerInsights.useQuery();
  const budget = api.beautyBudget.get.useQuery();
  const pins = api.inspiration.list.useQuery();
  const registries = api.giftRegistry.myRegistries.useQuery();
  // New wired components
  const kindnessStatus = api.kindnessPoints.getStatus.useQuery();
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
          <h1 className="text-2xl font-bold text-text-primary">لوحة التحكم</h1>
          <RebookReminder />
          <Link href="/self-care">
            <Button variant="outline" size="sm">
              <Icon name="sparkle" size="sm" />
              تقييم اليوم
            </Button>
          </Link>
        </div>

        {/* Stats */}
        {insights.isLoading ? (
          <DashboardSkeleton />
        ) : insights.isError ? (
          <ErrorAlert message="فشل تحميل الإحصائيات" onRetry={() => insights.refetch()} />
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="الحجوزات" value={insights.data?.bookingCount ?? 0} icon="" />
            <StatCard
              label="الإنفاق"
              value={formatCurrency(Number(insights.data?.totalSpent ?? 0))}
              icon=""
            />
            <StatCard
              label="الاستمرارية"
              value={` ${streakInfo?.currentStreak ?? 0} أسابيع`}
              icon=""
            />
            {budget?.data ? (
              <StatCard
                label="الميزانية"
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
              احجزي الآن
            </Button>
          </Link>
          <Link href="/gift-cards">
            <Button variant="outline">
              <Icon name="gift" size="sm" />
              بطاقات الهدية
            </Button>
          </Link>
          <Link href="/inspiration">
            <Button variant="outline">
              <Icon name="bookmark" size="sm" />
              لوحة الإلهام
            </Button>
          </Link>
          <Link href="/services/surprise-me">
            <Button variant="outline">
              <Icon name="sparkle" size="sm" />
              فاجئيني
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Bookings */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">آخر الحجوزات</h2>
              <Link href="/bookings" className="text-xs text-brand-600 hover:underline">
                عرض الكل
              </Link>
            </div>
            {bookings.isLoading ? (
              <CardListSkeleton count={3} />
            ) : bookings.isError ? (
              <ErrorAlert message="فشل التحميل" onRetry={() => bookings.refetch()} />
            ) : !bookings.data?.bookings || (bookings.data.bookings as unknown[]).length === 0 ? (
              <EmptyState title="لا توجد حجوزات" description="ابدئي رحلتكِ مع أول حجز" />
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
                            {new Date(b.startAt as string).toLocaleDateString('ar-SA')}
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
                  <h2 className="text-lg font-semibold text-text-primary">لوحة الإلهام</h2>
                  <Link href="/inspiration" className="text-xs text-brand-600 hover:underline">
                    عرض الكل
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
                  <h2 className="text-lg font-semibold text-text-primary">سجل الهدايا</h2>
                  <Link href="/gift-registry" className="text-xs text-brand-600 hover:underline">
                    عرض الكل
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
                  name: (s.titleJson as { ar?: string } | null)?.ar ?? '',
                  price: Number(s.basePrice),
                  category: 'facial' as const,
                  duration: `${s.durationMin} دقيقة`,
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
                name: circles.data.items[0]?.name ?? 'دائرة الجمال',
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
                label: (g.name as string) ?? 'هدف ادخار',
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
