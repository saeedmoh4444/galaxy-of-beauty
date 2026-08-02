'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ServiceMenuQrPage(): JSX.Element {
  const { data: techs, isLoading } = api.serviceMenuQr.list.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const generateMut = api.serviceMenuQr.generate.useMutation();
  const [result, setResult] = useState<Record<string,unknown> | null>(null);

  const list = (techs ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">📋 QR قائمة الخدمات</h1><p className="mt-1 text-sm text-gray-500">ولدي كود QR لقائمة خدمات الفنيات لمشاركته مع العميلات</p></div>

        {isLoading ? <CardSkeleton /> : (
          <Card padding="lg">
            <div className="space-y-3">{list.map((t: Record<string,unknown>) => (
              <div key={t.id as number} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                <div><p className="font-bold">{t.name as string}</p><p className="text-xs text-gray-500">{t.services as string}</p></div>
                <Button size="sm" onClick={() => generateMut.mutate({ technicianId: t.id as number }, { onSuccess: (d) => setResult(d as Record<string,unknown>) })}>توليد QR</Button>
              </div>
            ))}</div>
          </Card>
        )}

        {result && (
          <Card padding="lg" className="text-center border-2 border-brand-300">
            <h3 className="font-bold mb-3">📱 QR لقائمة {result.technicianName as string}</h3>
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-6xl">📱</div>
            <p className="text-xs text-gray-500 mt-2 break-all">{result.menuUrl as string}</p>
            <div className="flex gap-2 justify-center mt-3">
              <Button size="sm" onClick={() => navigator.clipboard.writeText(result.menuUrl as string)}>📋 نسخ الرابط</Button>
              <Button size="sm" variant="ghost" onClick={() => { const text = encodeURIComponent(result.shareText as string + '\n' + result.menuUrl); window.open(`https://wa.me/?text=${text}`, '_blank'); }}>💬 واتساب</Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
