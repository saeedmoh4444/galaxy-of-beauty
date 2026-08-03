'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function LastMilePage(): JSX.Element {
  const { data: products, isLoading, isError, refetch } = api.lastMileDelivery.products.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const orderMut = api.lastMileDelivery.order.useMutation();
  const [result, setResult] = useState<Record<string,unknown> | null>(null);

  if (isLoading) return <DashboardLayout role="CUSTOMER"><div className="mx-auto max-w-3xl space-y-6"><CardSkeleton /></div></DashboardLayout>;
  if (isError) return <DashboardLayout role="CUSTOMER"><div className="mx-auto max-w-3xl space-y-6"><ErrorAlert message="فشل تحميل البيانات" onRetry={() => refetch()} /></div></DashboardLayout>;

  const prods = (products ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div><h1 className="text-2xl font-bold">📦 توصيل سريع</h1><p className="mt-1 text-sm text-text-secondary">منتجات تجميل توصل لباب بيتكِ</p></div>
        {result ? (
          <Card padding="lg" className="text-center border-2 border-green-300"><span className="text-6xl">✅</span><h2 className="mt-4 text-xl font-bold">تم الطلب!</h2><p className="font-bold mt-1">{result.product as string}</p><p className="text-sm text-text-secondary">📦 {result.estimatedDelivery as string} · {formatCurrency(result.total as number)} ر.س</p></Card>
        ) : (
          <div className="space-y-3">{prods.map((p: Record<string,unknown>) => (
            <Card key={p.id as number} padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="text-3xl">{p.emoji as string}</span><div><p className="font-bold">{p.nameAr as string}</p><p className="text-xs text-text-secondary">⏱️ {p.deliveryTime as string}</p></div></div>
              <div className="text-right"><p className="font-bold text-brand-600">{formatCurrency(p.price as number)} ر.س</p><Button size="sm" onClick={() => orderMut.mutate({ productId: p.id as number, address: 'الرياض', paymentMethod: 'wallet' }, { onSuccess: (d) => setResult(d as Record<string,unknown>) })}>اطلب</Button></div>
            </Card>
          ))}</div>
        )}
      </div>
    </DashboardLayout>
  );
}
