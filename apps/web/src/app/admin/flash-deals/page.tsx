'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const SERVICES = [
  { id: 1, name: 'مانيكير', emoji: '💅' }, { id: 2, name: 'باديكير', emoji: '🦶' },
  { id: 3, name: 'تنظيف بشرة', emoji: '✨' }, { id: 4, name: 'مساج', emoji: '💆‍♀️' },
  { id: 5, name: 'صبغ شعر', emoji: '🎨' }, { id: 6, name: 'مكياج', emoji: '💄' },
];

export default function AdminFlashDealsPage(): JSX.Element {
  const { data: active, isLoading } = api.flashDeals.active.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const { data: upcoming } = api.flashDeals.upcoming.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const createMut = api.flashDeals.create.useMutation();
  const [svcId, setSvcId] = useState(1); const [discount, setDiscount] = useState(30); const [hours, setHours] = useState(24); const [maxRedemptions, setMax] = useState(20);

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">⚡ إدارة عروض الفلاش</h1><p className="mt-1 text-sm text-gray-500">إنشاء وإدارة العروض محدودة الوقت</p></div>

        <Card padding="lg"><h3 className="font-bold mb-3">➕ إنشاء عرض جديد</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={svcId} onChange={e => setSvcId(Number(e.target.value))} className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">{SERVICES.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}</select>
            <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} min={10} max={80} placeholder="نسبة الخصم %" className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            <input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} min={1} max={72} placeholder="المدة (ساعة)" className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            <input type="number" value={maxRedemptions} onChange={e => setMax(Number(e.target.value))} min={1} placeholder="الحد الأقصى" className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
          </div>
          <Button onClick={() => createMut.mutate({ serviceId: svcId, discountPercent: discount, durationHours: hours, maxRedemptions })} loading={createMut.isPending} className="w-full mt-3">⚡ إنشاء العرض</Button>
        </Card>

        <Card padding="lg"><h3 className="font-bold mb-3">🔥 العروض النشطة</h3>
          {isLoading ? <CardSkeleton/> : !(active??[]).length ? <p className="text-sm text-gray-400">لا توجد عروض نشطة</p> :
            <div className="space-y-2">{(active??[]).map((d: Record<string,unknown>) => (
              <div key={d.id as number} className="flex items-center justify-between rounded-lg border p-3">
                <div><span className="font-bold">{d.serviceNameAr as string}</span><span className="text-xs text-gray-500 mr-2">{d.titleAr as string ?? ''}</span></div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 line-through">{formatCurrency(d.originalPrice as number)}</span>
                  <span className="font-bold text-red-600">{formatCurrency(d.dealPrice as number)}</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">-{d.discountPercent as number}%</span>
                  <span className="text-xs text-gray-400">{d.currentRedemptions as number}/{d.maxRedemptions as number}</span>
                </div>
              </div>
            ))}</div>
          }
        </Card>
      </div>
    </DashboardLayout>
  );
}
