'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PaymentsPage(): JSX.Element {
  const { data: txData, isLoading } = api.wallet.getTransactions.useQuery({
    page: 1,
    limit: 50,
  }) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const transactions = (txData?.items as Array<Record<string, unknown>>) ?? [];
  const totalSpent = transactions
    .filter((t: Record<string, unknown>) => (t.amount as number) < 0)
    .reduce((s: number, t: Record<string, unknown>) => s + Math.abs(t.amount as number), 0);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> المدفوعات</h1>
          <p className="mt-1 text-sm text-text-secondary">سجل مدفوعاتكِ ومعاملاتكِ المالية</p>
        </div>

        <Card padding="lg" className="text-center bg-green-50">
          <p className="text-sm text-text-secondary">إجمالي المدفوعات</p>
          <p className="text-3xl font-extrabold text-green-600">{formatCurrency(totalSpent)}</p>
        </Card>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">لا توجد معاملات بعد</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((t: Record<string, unknown>) => (
              <div
                key={t.id as number}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-bold text-sm">
                    {(t.description as string) ?? (t.source as string) ?? (t.type as string)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(t.createdAt as string).toLocaleDateString('ar-SA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`font-bold ${(t.amount as number) > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {(t.amount as number) > 0 ? '+' : ''}
                  {formatCurrency(Math.abs(t.amount as number))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
