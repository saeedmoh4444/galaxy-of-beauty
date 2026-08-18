'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import {
  Card,
  KPIRowSkeleton,
  CardListSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Modal,
  Input,
  formatCurrency,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

type WalletBalance = RouterOutput['wallet']['getBalance'];
type TransactionItem = NonNullable<
  RouterOutput['wallet']['getTransactions']
>['transactions'][number];

export default function WalletPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: balance, isLoading, isError, refetch } = api.wallet.getBalance.useQuery();
  const txs = api.wallet.getTransactions.useQuery({ page: 1, limit: 20 });
  const withdrawMut = api.wallet.withdraw.useMutation({
    onSuccess: () => {
      setShowWithdraw(false);
      setAmount('');
      refetch();
      txs.refetch();
    },
  });
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');

  const bal = balance as WalletBalance | undefined;
  const transactions: TransactionItem[] = txs.data?.transactions ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">{t('wallet.title')}</h1>

        {isLoading ? (
          <KPIRowSkeleton count={3} />
        ) : isError ? (
          <ErrorAlert message={t('wallet.load-error')} onRetry={() => refetch()} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center">
              <p className="text-sm text-text-secondary">{t('wallet.total-balance')}</p>
              <p className="text-2xl font-bold text-brand-600">
                {formatCurrency(Number(bal?.totalBalance ?? 0))}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-text-secondary">{t('wallet.withdrawable-balance')}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(bal?.balance ?? 0))}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-text-secondary">{t('wallet.bonus')}</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(Number(bal?.bonusBalance ?? 0))}
              </p>
            </Card>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={() => setShowWithdraw(true)}>{t('wallet.request-withdraw')}</Button>
        </div>
        {msg && <p className="text-sm text-green-600">{msg}</p>}

        <h2 className="text-lg font-semibold">{t('wallet.transactions')}</h2>
        {txs.isLoading ? (
          <CardListSkeleton count={5} />
        ) : txs.isError ? (
          <ErrorAlert message={t('wallet.transactions-error')} onRetry={() => txs.refetch()} />
        ) : transactions.length === 0 ? (
          <EmptyState title={t('wallet.no-transactions')} />
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <Card key={tx.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{tx.description ?? ''}</p>
                    <p className="text-xs text-text-secondary">
                      {new Date(String(tx.createdAt)).toLocaleDateString(
                        locale === 'en' ? 'en-GB' : 'ar-SA',
                      )}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {tx.type === 'CREDIT' ? '+' : '-'}
                    {formatCurrency(Number(tx.amount))}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Modal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        title={t('wallet.request-withdraw')}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label={t('wallet.amount-label')}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint={t('wallet.min-withdraw')}
          />
          <Button
            className="w-full"
            onClick={() => {
              const a = Number(amount);
              if (a < 100) {
                setMsg(t('wallet.min-withdraw'));
                return;
              }
              withdrawMut.mutate({ amount: a, idempotencyKey: crypto.randomUUID() });
            }}
            loading={withdrawMut.isPending}
          >
            {t('wallet.confirm-withdraw')}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
