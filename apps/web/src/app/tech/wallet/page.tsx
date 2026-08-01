'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechWalletPage(): JSX.Element {
  const { data: wallet, isLoading } = api.wallet.getBalance.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const { data: txData } = api.wallet.getTransactions.useQuery({ page: 1, limit: 30 }) as { data: Record<string,unknown> | undefined };
  const withdrawMut = api.wallet.withdraw.useMutation();
  const [amount, setAmount] = useState('');
  const transactions = (txData?.items as Array<Record<string,unknown>>) ?? [];

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">💰 محفظتي</h1><p className="mt-1 text-sm text-gray-500">أرباحكِ وطلبات السحب</p></div>

        {isLoading ? <CardSkeleton/> : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold">{formatCurrency(Number(wallet?.balance ?? 0))}</p><p className="text-xs text-gray-500">الرصيد</p></Card>
            <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold text-purple-600">{formatCurrency(Number(wallet?.bonusBalance ?? 0))}</p><p className="text-xs text-gray-500">مكافآت</p></Card>
            <Card padding="lg" className="text-center"><p className="text-2xl font-extrabold text-green-600">{formatCurrency(Number(wallet?.totalEarnings ?? 0))}</p><p className="text-xs text-gray-500">إجمالي الأرباح</p></Card>
          </div>
        )}

        <Card padding="lg"><h3 className="font-bold mb-3">💸 طلب سحب</h3>
          <div className="flex gap-3"><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="المبلغ" className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" /><Button onClick={() => withdrawMut.mutate({ amount: Number(amount), idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2)}` })} loading={withdrawMut.isPending}>سحب</Button></div>
        </Card>

        {transactions.length > 0 && <Card padding="lg"><h3 className="font-bold mb-3">📋 المعاملات</h3>
          <div className="space-y-2">{transactions.map((t: Record<string,unknown>) => (
            <div key={t.id as number} className="flex justify-between text-sm border-b pb-2"><span className="text-gray-600">{t.type as string} · {new Date(t.createdAt as string).toLocaleDateString('ar-SA')}</span><span className={`font-bold ${(t.amount as number) > 0 ? 'text-green-600' : 'text-red-600'}`}>{t.amount as number > 0 ? '+' : ''}{formatCurrency(Math.abs(t.amount as number))}</span></div>
          ))}</div>
        </Card>}
      </div>
    </DashboardLayout>
  );
}
