'use client';
import { api } from '@/lib/trpc';
import { Card, KPIRowSkeleton, CardListSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CashbackPage(): JSX.Element {
  const { data: info, isLoading: infoLoading } = api.cashback.info.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: history, isLoading: histLoading } = api.cashback.history.useQuery({
    page: 1,
    limit: 20,
  }) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const transactions = (history?.items as Array<Record<string, unknown>>) ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> استرداد نقدي</h1>
          <p className="mt-1 text-sm text-text-secondary">كاش باك على كل حجوزاتكِ</p>
        </div>

        {infoLoading ? (
          <KPIRowSkeleton count={3} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card padding="lg" className="text-center bg-amber-50">
              <p className="text-2xl font-extrabold text-amber-600">{info?.rate as number}%</p>
              <p className="text-xs text-text-secondary">نسبة الاسترداد</p>
            </Card>
            <Card padding="lg" className="text-center bg-green-50">
              <p className="text-2xl font-extrabold text-green-600">
                {formatCurrency((info?.totalBalance as number) ?? 0)}
              </p>
              <p className="text-xs text-text-secondary">الرصيد</p>
            </Card>
            <Card padding="lg" className="text-center bg-purple-50">
              <p className="text-2xl font-extrabold text-purple-600">
                {(info?.isFirstBooking as boolean)
                  ? formatCurrency(info?.firstBookingBonus as number)
                  : '—'}
              </p>
              <p className="text-xs text-text-secondary">
                {(info?.isFirstBooking as boolean) ? 'مكافأة أول حجز' : 'لا مكافأة'}
              </p>
            </Card>
          </div>
        )}

        {(info?.isFirstBooking as boolean) && (
          <Card padding="lg" className="border-2 border-amber-300 bg-amber-50 text-center">
            <p className="font-bold text-amber-700">
              مكافأة أول حجز: {formatCurrency(info?.firstBookingBonus as number)} إضافية على أول حجز
              لكِ!
            </p>
          </Card>
        )}

        <Card padding="lg">
          <h3 className="font-bold mb-4"> سجل الاسترداد</h3>
          {histLoading ? (
            <CardListSkeleton count={4} />
          ) : transactions.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-4">
              لا توجد عمليات استرداد بعد
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t: Record<string, unknown>, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm border-b pb-2">
                  <span className="text-text-secondary">
                    {new Date(t.createdAt as string).toLocaleDateString('ar-SA')}
                  </span>
                  <span className="font-bold text-green-600">
                    +{formatCurrency(t.amount as number)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
