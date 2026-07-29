'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, Modal, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PriceDropAlertsPage(): JSX.Element {
  const { data: tracked } = api.priceDropAlerts.tracked.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data: myAlerts, refetch } = api.priceDropAlerts.myAlerts.useQuery() as { data: Array<Record<string,unknown>> | undefined; refetch: () => void };
  const createMut = api.priceDropAlerts.create.useMutation({ onSuccess: () => { setShow(false); refetch(); } });
  const deleteMut = api.priceDropAlerts.delete.useMutation({ onSuccess: () => refetch() });

  const [show, setShow] = useState(false); const [sname, setSname] = useState(''); const [tprice, setTprice] = useState(100);

  const services = (tracked ?? []) as Array<Record<string,unknown>>;
  const alerts = (myAlerts ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🔔 تنبيهات الأسعار</h1><p className="mt-1 text-sm text-gray-500">تابعي أسعار الخدمات واحصلي على تنبيه عند انخفاضها</p></div>

        <Card padding="lg"><h3 className="font-bold mb-4">📉 خدمات انخفض سعرها</h3>
          <div className="grid gap-3 sm:grid-cols-3">{services.map((s: Record<string,unknown>) => (
            <div key={s.id as number} className="rounded-xl bg-green-50 dark:bg-green-950 p-3 text-center">
              <span className="text-2xl">{s.emoji as string}</span><p className="font-bold text-sm">{s.nameAr as string}</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs text-gray-400 line-through">{formatCurrency(s.prevPrice as number)}</span>
                <span className="text-sm font-extrabold text-green-600">{formatCurrency(s.price as number)} ر.س</span>
              </div>
            </div>
          ))}</div>
        </Card>

        <Card padding="lg"><div className="flex items-center justify-between mb-4"><h3 className="font-bold">🔔 تنبيهاتي</h3><Button size="sm" onClick={() => setShow(true)}>+ إضافة</Button></div>
          {alerts.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">لا توجد تنبيهات</p> :
            <div className="space-y-2">{alerts.map((a: Record<string,unknown>) => (
              <div key={a.id as number} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-3"><div><span className="text-lg mr-2">{a.emoji as string}</span><span className="font-bold">{a.serviceName as string}</span></div><div className="flex items-center gap-3"><span className="text-sm">السعر المستهدف: {formatCurrency(a.targetPrice as number)}</span><button onClick={() => deleteMut.mutate({ id: a.id as number })} className="text-red-400">🗑️</button></div></div>
            ))}</div>
        }</Card>

        <Modal open={show} onClose={() => setShow(false)} title="تنبيه سعر"><div className="space-y-3">
          <input value={sname} onChange={(e) => setSname(e.target.value)} placeholder="اسم الخدمة" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
          <div><label className="text-sm">السعر المستهدف: {formatCurrency(tprice)}</label><input type="range" min={50} max={500} step={10} value={tprice} onChange={(e) => setTprice(parseInt(e.target.value))} className="w-full accent-brand-600 mt-1" /></div>
          <Button onClick={() => { if (sname.trim()) createMut.mutate({ serviceName: sname.trim(), targetPrice: tprice, currentPrice: tprice + 50 }); }} loading={createMut.isPending} className="w-full">🔔 تفعيل</Button>
        </div></Modal>
      </div>
    </DashboardLayout>
  );
}
