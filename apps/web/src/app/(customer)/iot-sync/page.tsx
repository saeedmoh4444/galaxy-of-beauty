'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function IoTSyncPage(): JSX.Element {
  const { data: devices, isLoading, isError, refetch } = api.iotSync.devices.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const connectMut = api.iotSync.connect.useMutation();
  const syncMut = api.iotSync.syncData.useMutation();

  if (isLoading) return <DashboardLayout role="CUSTOMER"><div className="mx-auto max-w-3xl space-y-6"><CardSkeleton /></div></DashboardLayout>;
  if (isError) return <DashboardLayout role="CUSTOMER"><div className="mx-auto max-w-3xl space-y-6"><ErrorAlert message="فشل تحميل البيانات" onRetry={() => refetch()} /></div></DashboardLayout>;

  const list = (devices ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">📡 الأجهزة الذكية</h1><p className="mt-1 text-sm text-text-secondary">اربطي أجهزة العناية الذكية لمتابعة بشرتكِ</p></div>
        <div className="grid gap-4 sm:grid-cols-3">{list.map((d: Record<string,unknown>) => (
          <Card key={d.key as string} padding="lg" className="text-center">
            <span className="text-5xl">{d.emoji as string}</span><h3 className="font-bold mt-2">{d.nameAr as string}</h3>
            <p className={`text-xs mt-1 ${d.status === 'connected' ? 'text-green-600' : 'text-text-tertiary'}`}>{d.status === 'connected' ? '🟢 متصل' : '⚫ غير متصل'}</p>
            <div className="mt-2">{(d.features as string[])?.slice(0,2).map((f: string) => <p key={f} className="text-[10px] text-text-secondary">• {f}</p>)}</div>
            {d.status === 'connected' ? <Button size="sm" className="mt-3" onClick={() => syncMut.mutate({ deviceKey: d.key as string })}>مزامنة</Button> :
              <Button size="sm" className="mt-3" onClick={() => connectMut.mutate({ deviceKey: d.key as string })}>ربط</Button>}
          </Card>
        ))}</div>
      </div>
    </DashboardLayout>
  );
}
