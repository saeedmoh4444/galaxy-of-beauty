'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input, formatCurrency } from '@galaxy/shared';

export default function AdminFinancePage(): JSX.Element {
  const financials = api.admin.getFinancials.useQuery({} as never);
  const payouts = api.payouts.listForAdmin.useQuery({ page: 1, limit: 20 });
  const calculateMut = api.payouts.calculate.useMutation();
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const fin = financials.data as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">المالية</h1>

      {financials.isLoading ? <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}</div>
      : financials.isError ? <ErrorAlert message="فشل التحميل" onRetry={() => financials.refetch()} />
      : <div className="grid gap-4 md:grid-cols-4">
          <Card className="text-center"><p className="text-sm text-gray-500">الإيرادات</p><p className="text-2xl font-bold text-brand-600">{formatCurrency(Number(fin?.totalRevenue ?? 0))}</p></Card>
          <Card className="text-center"><p className="text-sm text-gray-500">رسوم المنصة</p><p className="text-2xl font-bold text-amber-600">{formatCurrency(Number(fin?.platformFees ?? 0))}</p></Card>
          <Card className="text-center"><p className="text-sm text-gray-500">أرباح الفنيات</p><p className="text-2xl font-bold text-green-600">{formatCurrency(Number(fin?.technicianEarnings ?? 0))}</p></Card>
          <Card className="text-center"><p className="text-sm text-gray-500">مدفوعات معلقة</p><p className="text-2xl font-bold text-purple-600">{formatCurrency(Number(fin?.pendingPayouts ?? 0))}</p></Card>
        </div>
      }

      <Card>
        <h2 className="mb-3 text-lg font-semibold">احتساب المدفوعات</h2>
        <div className="flex gap-4"><Input label="من تاريخ" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} /><Input label="إلى تاريخ" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /><Button onClick={() => calculateMut.mutate({ periodStart: new Date(periodStart).toISOString(), periodEnd: new Date(periodEnd).toISOString() })} loading={calculateMut.isPending} className="self-end">احتساب</Button></div>
        {calculateMut.data && <p className="mt-2 text-sm text-green-600">تم الاحتساب بنجاح</p>}
      </Card>

      <Card><h2 className="mb-3 text-lg font-semibold">سجل المدفوعات</h2>
        {payouts.isLoading ? <CardSkeleton /> : payouts.isError ? <ErrorAlert message="فشل التحميل" onRetry={() => payouts.refetch()} />
        : !payouts.data || (payouts.data as unknown as Record<string, unknown>[]).length === 0 ? <EmptyState title="لا توجد مدفوعات" />
        : <div className="space-y-2">{(payouts.data as unknown as Record<string, unknown>[]).map((p: Record<string, unknown>) => <div key={p.id as number} className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800"><span>{formatCurrency(Number(p.amount))}</span><span className="text-sm text-gray-500">{p.status as string}</span></div>)}</div>}
      </Card>
    </div>
  );
}
