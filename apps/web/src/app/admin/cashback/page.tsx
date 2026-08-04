'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminCashbackPage(): JSX.Element {
  const [rate, setRate] = useState(5);
  const setRateMut = api.cashback.setRate.useMutation();

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">💸 إدارة الكاش باك</h1><p className="mt-1 text-sm text-text-secondary">تعديل نسبة الاسترداد النقدي</p></div>

        <Card padding="lg" className="text-center">
          <p className="text-6xl mb-4">💸</p>
          <p className="text-sm text-text-secondary">نسبة الكاش باك الحالية</p>
          <p className="text-4xl font-extrabold text-brand-600 mt-2">{rate}%</p>
        </Card>

        <Card padding="lg"><h3 className="font-bold mb-3">⚙️ تعديل النسبة</h3>
          <div className="flex gap-3">
            <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} min={1} max={20} className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            <Button onClick={() => setRateMut.mutate({ rate })} loading={setRateMut.isPending}>حفظ</Button>
          </div>
          <p className="text-xs text-text-tertiary mt-2">النطاق المسموح: ١٪ — ٢٠٪</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
