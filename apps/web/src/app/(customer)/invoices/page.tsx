'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency  } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function InvoicesPage(): JSX.Element {
  const { data: bookingsData, isLoading } = api.bookings.list.useQuery({ page: 1, limit: 50 }) as { data: Record<string,unknown> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const bookings = (bookingsData?.bookings as Array<Record<string,unknown>>) ?? [];
  const completed = bookings.filter((b: Record<string,unknown>) => b.status === 'COMPLETED');
  const totalSpent = completed.reduce((s: number, b: Record<string,unknown>) => s + (Number(b.totalAmount) || 0), 0);

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🧾 الفواتير</h1><p className="mt-1 text-sm text-gray-500">سجل مدفوعاتكِ وفواتيركِ</p></div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold">{completed.length}</p><p className="text-xs text-gray-500">فواتير مدفوعة</p></Card>
          <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold text-green-600">{formatCurrency(totalSpent)}</p><p className="text-xs text-gray-500">إجمالي المدفوعات</p></Card>
        </div>

        {isLoading ? <div className="space-y-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
          completed.length === 0 ? <Card padding="lg" className="text-center py-8"><p className="text-4xl mb-2">🧾</p><p className="text-gray-500">لا توجد فواتير بعد</p></Card> :
          <div className="space-y-2">{completed.map((b: Record<string,unknown>) => {
            const service = b.service as Record<string,unknown> | undefined;
            const slot = (b.slot as Record<string,unknown>) ?? (b as Record<string,unknown>);
            return (
              <Card key={b.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{(service?.titleJson as Record<string,string>)?.ar ?? `حجز #${b.id}`}</p>
                    <p className="text-xs text-gray-500">{new Date((slot?.startAt ?? b.createdAt) as string).toLocaleDateString('ar-SA', {day:'numeric', month:'long', year:'numeric'})} · {b.bookingCode as string}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(Number(b.totalAmount) || 0)}</p>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">✅ مدفوعة</span>
                  </div>
                </div>
              </Card>
            );
          })}</div>
        }
      </div>
    </DashboardLayout>
  );
}
