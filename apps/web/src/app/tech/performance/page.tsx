'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechPerformancePage(): JSX.Element {
  const { data, isLoading } = api.performance.myDashboard.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };

  const monthlyEarnings = (data?.monthlyEarnings as Array<Record<string,unknown>>) ?? [];

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">📊 أدائي</h1><p className="mt-1 text-sm text-gray-500">إحصائيات وأرباحكِ</p></div>

        {isLoading ? <CardSkeleton/> : (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold">{data?.totalBookings as number}</p><p className="text-xs text-gray-500">إجمالي الحجوزات</p></Card>
              <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold text-green-600">{data?.completedBookings as number}</p><p className="text-xs text-gray-500">مكتملة</p></Card>
              <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold text-purple-600">{data?.completionRate as number}%</p><p className="text-xs text-gray-500">نسبة الإكمال</p></Card>
              <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold text-amber-600">⭐{data?.avgRating as number}</p><p className="text-xs text-gray-500">التقييم ({data?.totalReviews as number} تقييم)</p></Card>
            </div>

            <Card padding="lg" className="text-center border-2 border-green-200 bg-green-50">
              <p className="text-sm text-gray-500">إجمالي الأرباح</p>
              <p className="text-3xl font-extrabold text-green-600">{formatCurrency(data?.totalEarnings as number)}</p>
            </Card>

            {monthlyEarnings.length > 0 && <Card padding="lg">
              <h3 className="font-bold mb-4">📈 الأرباح الشهرية</h3>
              <div className="space-y-3">
                {monthlyEarnings.map((m: Record<string,unknown>, i: number) => {
                  const maxTotal = Math.max(...monthlyEarnings.map(x => x.total as number), 1);
                  const pct = Math.round(((m.total as number) / maxTotal) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1"><span>{m.month as string}</span><span className="font-bold">{formatCurrency(m.total as number)}</span></div>
                      <div className="h-3 bg-gray-100 rounded-full"><div className="h-3 bg-green-500 rounded-full" style={{width:`${pct}%`}}/></div>
                      <p className="text-xs text-gray-400 mt-0.5">{m.count as number} حجز</p>
                    </div>
                  );
                })}
              </div>
            </Card>}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
