'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal, Input, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function WalletPage(): JSX.Element {
  const { data: balance, isLoading, isError, refetch } = api.wallet.getBalance.useQuery();
  const txs = api.wallet.getTransactions.useQuery({ page: 1, limit: 20 });
  const withdrawMut = api.wallet.withdraw.useMutation({ onSuccess: () => { setShowWithdraw(false); setAmount(''); refetch(); txs.refetch(); } });
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');

  const bal = balance as Record<string, unknown>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">المحفظة</h1>

        {isLoading ? <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
        : isError ? <ErrorAlert message="فشل تحميل المحفظة" onRetry={() => refetch()} />
        : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center"><p className="text-sm text-gray-500">الرصيد الكلي</p><p className="text-2xl font-bold text-brand-600">{formatCurrency(Number(bal?.totalBalance ?? 0))}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">الرصيد القابل للسحب</p><p className="text-2xl font-bold text-green-600">{formatCurrency(Number(bal?.balance ?? 0))}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">رصيد المكافآت</p><p className="text-2xl font-bold text-amber-600">{formatCurrency(Number(bal?.bonusBalance ?? 0))}</p></Card>
          </div>
        )}

        <div className="flex justify-end"><Button onClick={() => setShowWithdraw(true)}>طلب سحب</Button></div>
        {msg && <p className="text-sm text-green-600">{msg}</p>}

        <h2 className="text-lg font-semibold">المعاملات</h2>
        {txs.isLoading ? <CardSkeleton />
        : txs.isError ? <ErrorAlert message="فشل تحميل المعاملات" onRetry={() => txs.refetch()} />
        : !txs.data?.transactions || (txs.data.transactions as unknown[]).length === 0 ? <EmptyState title="لا توجد معاملات" />
        : <div className="space-y-2">{(txs.data.transactions as Record<string, unknown>[]).map((t: Record<string, unknown>) => (
            <Card key={t.id as number} padding="sm">
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">{t.description as string}</p><p className="text-xs text-gray-500">{new Date(t.createdAt as string).toLocaleDateString('ar-SA')}</p></div><p className={`text-sm font-semibold ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Number(t.amount))}</p></div>
            </Card>
          ))}</div>
        }
      </div>
      <Modal open={showWithdraw} onClose={() => setShowWithdraw(false)} title="طلب سحب" size="sm">
        <div className="space-y-4">
          <Input label="المبلغ (ر.س)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} hint="الحد الأدنى ١٠٠ ر.س" />
          <Button className="w-full" onClick={() => { const a = Number(amount); if (a < 100) { setMsg('الحد الأدنى ١٠٠ ر.س'); return; } withdrawMut.mutate({ amount: a, idempotencyKey: crypto.randomUUID() }); }} loading={withdrawMut.isPending}>تأكيد السحب</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
