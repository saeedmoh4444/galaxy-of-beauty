'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RebookReminder } from '@/components/RebookReminder';

export default function CustomerDashboardPage(): JSX.Element {
  const bookings = api.bookings.list.useQuery({ limit: 3 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insights = api.analytics.customerInsights.useQuery() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mood = api.selfCare?.todayMood?.useQuery?.() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const budget = (api as any).beautyBudget?.get?.useQuery?.() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pins = (api as any).inspiration?.list?.useQuery?.() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registries = (api as any).giftRegistry?.myRegistries?.useQuery?.() as any;

  const streakInfo = insights.data?.streakInfo as Record<string, any> | undefined;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <RebookReminder />
          <Link href="/customer/self-care"><Button variant="outline" size="sm">🌸 تقييم اليوم</Button></Link>
        </div>

        {/* Stats */}
        {insights.isLoading ? <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}</div>
        : insights.isError ? <ErrorAlert message="فشل تحميل الإحصائيات" onRetry={() => insights.refetch()} />
        : (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="text-center"><p className="text-sm text-gray-500">الحجوزات</p><p className="text-2xl font-bold text-brand-600">{insights.data?.bookingCount ?? 0}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">الإنفاق</p><p className="text-2xl font-bold text-green-600">{formatCurrency(Number(insights.data?.totalSpent ?? 0))}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">الاستمرارية</p><p className="text-2xl font-bold text-purple-600">🔥 {streakInfo?.currentStreak ?? 0} أسابيع</p></Card>
            {budget?.data ? (
              <Card className="text-center"><p className="text-sm text-gray-500">الميزانية</p><p className={`text-2xl font-bold ${Number(budget.data.remaining) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(Number(budget.data.remaining))}</p></Card>
            ) : <CardSkeleton />}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/customer/bookings/create"><Button>✨ احجزي الآن</Button></Link>
          <Link href="/customer/gift-cards"><Button variant="outline">🎁 بطاقات الهدية</Button></Link>
          <Link href="/customer/inspiration"><Button variant="outline">📌 لوحة الإلهام</Button></Link>
          <Link href="/services/surprise-me"><Button variant="outline">🎲 فاجئيني</Button></Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Bookings */}
          <div>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">آخر الحجوزات</h2><Link href="/customer/bookings" className="text-xs text-brand-600 hover:underline">عرض الكل</Link></div>
            {bookings.isLoading ? <CardSkeleton />
            : bookings.isError ? <ErrorAlert message="فشل التحميل" onRetry={() => bookings.refetch()} />
            : !bookings.data?.bookings || (bookings.data.bookings as unknown[]).length === 0
              ? <EmptyState title="لا توجد حجوزات" description="ابدئي رحلتكِ مع أول حجز" />
              : <div className="space-y-2">{(bookings.data.bookings as unknown as Record<string, unknown>[]).slice(0, 3).map((b: Record<string, unknown>) => (
                <Card key={b.id as number} padding="sm" hover>
                  <div className="flex items-center justify-between">
                    <div><p className="font-semibold text-sm">{b.bookingCode as string}</p><p className="text-xs text-gray-500">{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</p></div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}>{b.status as string}</span>
                  </div>
                </Card>
              ))}</div>
            }
          </div>

          {/* Inspiration + Registry */}
          <div className="space-y-4">
            {pins?.data?.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between"><h2 className="text-lg font-semibold">📌 لوحة الإلهام</h2><Link href="/customer/inspiration" className="text-xs text-brand-600 hover:underline">عرض الكل</Link></div>
                <div className="flex gap-2 overflow-x-auto pb-2">{(pins.data as Array<Record<string, any>>).slice(0, 3).map((p: Record<string, any>) => (
                  <div key={p.id} className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">✨</div>}
                  </div>
                ))}</div>
              </div>
            )}
            {registries?.data?.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between"><h2 className="text-lg font-semibold">🎁 سجل الهدايا</h2><Link href="/customer/gift-registry" className="text-xs text-brand-600 hover:underline">عرض الكل</Link></div>
                {registries.data.slice(0, 2).map((r: Record<string, any>) => {
                  const pct = r.targetAmount > 0 ? Math.min(100, (Number(r.raisedAmount) / Number(r.targetAmount)) * 100) : 0;
                  return (
                    <Card key={r.id} padding="sm" className="mb-2">
                      <div className="flex items-center justify-between"><div><p className="font-semibold text-sm">{r.title}</p><p className="text-xs text-gray-500">{formatCurrency(Number(r.raisedAmount))} / {formatCurrency(Number(r.targetAmount))}</p></div><span className="text-xs font-bold text-brand-600">{pct.toFixed(0)}%</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} /></div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Community + Wellness row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/customer/self-care"><Card hover padding="md" className="text-center"><span className="text-3xl">🌸</span><p className="mt-2 font-semibold text-sm">العناية الذاتية</p><p className="text-xs text-gray-500">تقييم مزاجكِ اليومي</p></Card></Link>
          <Link href="/customer/beauty-budget"><Card hover padding="md" className="text-center"><span className="text-3xl">💰</span><p className="mt-2 font-semibold text-sm">ميزانية الجمال</p><p className="text-xs text-gray-500">تتبعي إنفاقكِ الشهري</p></Card></Link>
          <Link href="/community"><Card hover padding="md" className="text-center"><span className="text-3xl">💬</span><p className="mt-2 font-semibold text-sm">مجتمع الجمال</p><p className="text-xs text-gray-500">شاركي تجاربكِ وآرائكِ</p></Card></Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
