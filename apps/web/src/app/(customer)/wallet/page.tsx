'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import {
  Card,
  CardSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Modal,
  Input,
  formatCurrency,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

type WalletBalance = RouterOutput['wallet']['getBalance'];
type TransactionItem = NonNullable<
  RouterOutput['wallet']['getTransactions']
>['transactions'][number];

export default function WalletPage(): JSX.Element {
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
        <h1 className="text-2xl font-bold">المحفظة</h1>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل المحفظة" onRetry={() => refetch()} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center">
              <p className="text-sm text-text-secondary">الرصيد الكلي</p>
              <p className="text-2xl font-bold text-brand-600">
                {formatCurrency(Number(bal?.totalBalance ?? 0))}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-text-secondary">الرصيد القابل للسحب</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(bal?.balance ?? 0))}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-text-secondary">رصيد المكافآت</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(Number(bal?.bonusBalance ?? 0))}
              </p>
            </Card>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={() => setShowWithdraw(true)}>طلب سحب</Button>
        </div>
        {msg && <p className="text-sm text-green-600">{msg}</p>}

        <h2 className="text-lg font-semibold">المعاملات</h2>
        {txs.isLoading ? (
          <CardSkeleton />
        ) : txs.isError ? (
          <ErrorAlert message="فشل تحميل المعاملات" onRetry={() => txs.refetch()} />
        ) : transactions.length === 0 ? (
          <EmptyState title="لا توجد معاملات" />
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <Card key={t.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.description ?? ''}</p>
                    <p className="text-xs text-text-secondary">
                      {new Date(String(t.createdAt)).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {t.type === 'CREDIT' ? '+' : '-'}
                    {formatCurrency(Number(t.amount))}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Modal open={showWithdraw} onClose={() => setShowWithdraw(false)} title="طلب سحب" size="sm">
        <div className="space-y-4">
          <Input
            label="المبلغ (ر.س)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint="الحد الأدنى ١٠٠ ر.س"
          />
          <Button
            className="w-full"
            onClick={() => {
              const a = Number(amount);
              if (a < 100) {
                setMsg('الحد الأدنى ١٠٠ ر.س');
                return;
              }
              withdrawMut.mutate({ amount: a, idempotencyKey: crypto.randomUUID() });
            }}
            loading={withdrawMut.isPending}
          >
            تأكيد السحب
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
