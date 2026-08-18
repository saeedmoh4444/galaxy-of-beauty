'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function PaymentsPage(): JSX.Element {
  const { t, locale } = useLocale();
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
    .filter((tx: Record<string, unknown>) => (tx.amount as number) < 0)
    .reduce((s: number, tx: Record<string, unknown>) => s + Math.abs(tx.amount as number), 0);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('payments.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('payments.subtitle')}</p>
        </div>

        <Card padding="lg" className="text-center bg-green-50">
          <p className="text-sm text-text-secondary">{t('payments.totalSpent')}</p>
          <p className="text-3xl font-extrabold text-green-600">{formatCurrency(totalSpent)}</p>
        </Card>

        {isLoading ? (
          <CardListSkeleton count={5} />
        ) : transactions.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('payments.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx: Record<string, unknown>) => (
              <div
                key={tx.id as number}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-bold text-sm">
                    {(tx.description as string) ?? (tx.source as string) ?? (tx.type as string)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(tx.createdAt as string).toLocaleDateString(
                      locale === 'en' ? 'en-GB' : 'ar-SA',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      },
                    )}
                  </p>
                </div>
                <span
                  className={`font-bold ${(tx.amount as number) > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {(tx.amount as number) > 0 ? '+' : ''}
                  {formatCurrency(Math.abs(tx.amount as number))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
