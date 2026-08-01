'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyExpensesPage(): JSX.Element {
  const { data, isLoading } = api.beautyExpenses.summary.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">💰 تحليل الإنفاق</h1><p className="mt-1 text-sm text-gray-500">تتبعي مصاريفكِ على خدمات التجميل</p></div>

        {isLoading ? <CardSkeleton/> : (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold text-brand-600">{formatCurrency(data?.thisMonthTotal as number ?? 0)}</p><p className="text-xs text-gray-500">هذا الشهر</p></Card>
              <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold">{formatCurrency(data?.lastMonthTotal as number ?? 0)}</p><p className="text-xs text-gray-500">الشهر الماضي</p></Card>
              <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold text-green-600">{formatCurrency(data?.thisYearTotal as number ?? 0)}</p><p className="text-xs text-gray-500">هذه السنة</p></Card>
              <Card padding="lg" className="text-center"><p className={`text-2xl font-extrabold ${(data?.monthOverMonth as number ?? 0) >= 0 ? 'text-red-500' : 'text-green-600'}`}>{data?.monthOverMonth as number ?? 0}%</p><p className="text-xs text-gray-500">مقارنة بالشهر الماضي</p></Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card padding="lg"><h3 className="font-bold mb-3">📊 توزيع الإنفاق</h3>
                {(data?.byCategory as Array<Record<string,unknown>>)?.length ? (data?.byCategory as Array<Record<string,unknown>>).map((c: Record<string,unknown>) => {
                  const pct = Math.round(((c.total as number) / (data?.thisMonthTotal as number || 1)) * 100);
                  return (
                    <div key={c.categoryId as number} className="mb-3">
                      <div className="flex justify-between text-sm mb-1"><span>{c.name as string}</span><span className="font-bold">{formatCurrency(c.total as number)}</span></div>
                      <div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-brand-600 rounded-full" style={{width:`${pct}%`}}/></div>
                      <p className="text-xs text-gray-400 mt-0.5">{c.count as number} حجز</p>
                    </div>
                  );
                }) : <p className="text-sm text-gray-400">لا توجد بيانات</p>}
              </Card>

              <Card padding="lg"><h3 className="font-bold mb-3">📈 الاتجاه الشهري</h3>
                {(data?.monthlyTrend as Array<Record<string,unknown>>)?.length ? (
                  <div className="space-y-3">{(data?.monthlyTrend as Array<Record<string,unknown>>).map((m: Record<string,unknown>) => {
                    const maxVal = Math.max(...(data?.monthlyTrend as Array<Record<string,unknown>>).map((x: Record<string,unknown>) => x.total as number), 1);
                    const pct = Math.round(((m.total as number) / maxVal) * 100);
                    return (
                      <div key={m.month as string}><div className="flex justify-between text-sm mb-1"><span>{m.month as string}</span><span className="font-bold">{formatCurrency(m.total as number)}</span></div><div className="h-3 bg-gray-100 rounded-full"><div className="h-3 bg-green-500 rounded-full" style={{width:`${pct}%`}}/></div></div>
                    );
                  })}</div>
                ) : <p className="text-sm text-gray-400">لا توجد بيانات</p>}
              </Card>
            </div>

            <Card padding="lg" className="text-center">
              <p className="text-sm text-gray-500">متوسط تكلفة الحجز</p>
              <p className="text-3xl font-extrabold text-brand-600">{formatCurrency(data?.avgPerBooking as number ?? 0)}</p>
              <p className="text-xs text-gray-400 mt-1">{data?.totalBookingsThisMonth as number ?? 0} حجز هذا الشهر</p>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
