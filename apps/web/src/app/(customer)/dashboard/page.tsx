/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import {
  Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency,
  StatCard, PageContainer, Icon, DashboardSkeleton, CardListSkeleton,
  DailyBeautyTipCard, KindnessPointsBadge, SisterhoodWall, SelfCareReminder,
  BeautyBudgetCard, BeautyCircleCard, BeautySavingsGoal,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RebookReminder } from '@/components/RebookReminder';

export default function CustomerDashboardPage(): JSX.Element {
  const bookings = api.bookings.list.useQuery({ limit: 3 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insights = api.analytics.customerInsights.useQuery() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _mood = api.selfCare?.todayMood?.useQuery?.() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const budget = (api as any).beautyBudget?.get?.useQuery?.() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pins = (api as any).inspiration?.list?.useQuery?.() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registries = (api as any).giftRegistry?.myRegistries?.useQuery?.() as any;
  // New wired components
  const dailyTip = (api as any).dailyBeautyTip?.today?.useQuery?.() as any;
  const kindnessStatus = (api as any).kindnessPoints?.getStatus?.useQuery?.() as any;
  const compliments = (api as any).sisterhoodCompliments?.list?.useQuery?.({ limit: 4 }) as any;
  const circles = (api as any).beautyCircles?.list?.useQuery?.({ limit: 3 }) as any;
  const savingsGoals = (api as any).savingsGoals?.list?.useQuery?.() as any;
  // Budget services under 100 SAR
  const budgetServices = (api as any).services?.list?.useQuery?.({ limit: 5, maxPrice: 100 }) as any;

  const streakInfo = insights.data?.streakInfo as Record<string, any> | undefined;

  return (
    <DashboardLayout role="CUSTOMER">
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
            <StatCard
              label="الحجوزات"
              value={insights.data?.bookingCount ?? 0}
              icon="📅"
            />
            <StatCard
              label="الإنفاق"
              value={formatCurrency(Number(insights.data?.totalSpent ?? 0))}
              icon="💰"
            />
            <StatCard
              label="الاستمرارية"
              value={`🔥 ${streakInfo?.currentStreak ?? 0} أسابيع`}
              icon="🔥"
            />
            {budget?.data ? (
              <StatCard
                label="الميزانية"
                value={formatCurrency(Number(budget.data.remaining))}
                icon="💳"
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
                {(bookings.data.bookings as unknown as Record<string, unknown>[]).slice(0, 3).map((b: Record<string, unknown>) => (
                  <Card key={b.id as number} padding="sm" hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-text-primary">{b.bookingCode as string}</p>
                        <p className="text-xs text-text-secondary">
                          {new Date(b.startAt as string).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.status === 'COMPLETED'
                          ? 'bg-success-subtle text-success'
                          : b.status === 'CANCELLED'
                            ? 'bg-danger-subtle text-danger'
                            : 'bg-info-subtle text-info'
                      }`}>
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
            {pins?.data?.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">لوحة الإلهام</h2>
                  <Link href="/inspiration" className="text-xs text-brand-600 hover:underline">
                    عرض الكل
                  </Link>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {(pins.data as Array<Record<string, any>>).slice(0, 3).map((p: Record<string, any>) => (
                    <div
                      key={p.id}
                      className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted dark:bg-gray-800"
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl" aria-hidden="true">
                          ✨
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {registries?.data?.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">سجل الهدايا</h2>
                  <Link href="/gift-registry" className="text-xs text-brand-600 hover:underline">
                    عرض الكل
                  </Link>
                </div>
                {registries.data.slice(0, 2).map((r: Record<string, any>) => {
                  const pct = r.targetAmount > 0
                    ? Math.min(100, (Number(r.raisedAmount) / Number(r.targetAmount)) * 100)
                    : 0;
                  return (
                    <Card key={r.id} padding="sm" className="mb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-text-primary">{r.title}</p>
                          <p className="text-xs text-text-secondary">
                            {formatCurrency(Number(r.raisedAmount))} / {formatCurrency(Number(r.targetAmount))}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-brand-600">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-surface-muted dark:bg-gray-700">
                        <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Community + Wellness row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <SelfCareReminder />
          {budget?.data && (
            <BeautyBudgetCard
              services={(budgetServices?.data?.items as any[])?.slice(0, 4)?.map((s: any) => ({
                name: (s.titleJson as any)?.ar ?? '',
                price: Number(s.basePrice),
                category: 'facial' as const,
                duration: `${s.durationMin} دقيقة`,
              })) ?? []}
            />
          )}
          <DailyBeautyTipCard />
        </div>

        {/* Sisterhood + Circles row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SisterhoodWall />
          {circles?.data?.items?.length > 0 && (
            <BeautyCircleCard
              circle={{
                name: (circles.data.items[0] as any)?.name ?? 'دائرة الجمال',
                topic: ((circles.data.items[0] as any)?.topic ?? 'skincare') as any,
                members: (circles.data.items[0] as any)?.members ?? 0,
                cover: (circles.data.items[0] as any)?.cover ?? '🌸',
              }}
            />
          )}
        </div>

        {/* Kindness + Savings row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <KindnessPointsBadge points={kindnessStatus?.data?.points ?? 0} />
          {savingsGoals?.data?.length > 0 && (
            <BeautySavingsGoal
              goals={(savingsGoals.data as any[]).slice(0, 2).map((g: any) => ({
                label: g.name ?? 'هدف ادخار',
                target: g.amount ?? 0,
                saved: g.saved ?? 0,
                monthly: g.monthly ?? 0,
                emoji: g.emoji ?? '💰',
              }))}
            />
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
