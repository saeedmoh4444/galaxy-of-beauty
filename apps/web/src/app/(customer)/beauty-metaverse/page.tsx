'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyMetaversePage(): JSX.Element {
  const { data: salons, isLoading, isError, refetch } = api.beautyMetaverse.salons.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const enterMut = api.beautyMetaverse.enter.useMutation();
  const [result, setResult] = useState<Record<string,unknown> | null>(null);

  const list = (salons ?? []) as Array<Record<string,unknown>>;
  if (isLoading) return <DashboardLayout role="CUSTOMER"><div className="mx-auto max-w-4xl space-y-6"><CardSkeleton /></div></DashboardLayout>;
  if (isError) return <DashboardLayout role="CUSTOMER"><div className="mx-auto max-w-4xl space-y-6"><ErrorAlert message="فشل تحميل البيانات" onRetry={() => refetch()} /></div></DashboardLayout>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">🎮 عالم الجمال الافتراضي</h1><p className="mt-1 text-sm text-gray-500">تجولي في صالونات افتراضية ثلاثية الأبعاد</p></div>
        {result ? (
          <Card padding="lg" className="text-center border-2 border-purple-300"><span className="text-6xl">🌐</span><h2 className="mt-4 text-xl font-bold">{(result.welcomeMessage as string)}</h2><div className="mt-3 flex flex-wrap justify-center gap-2">{(result.availableActions as string[])?.map((a: string) => <span key={a} className="rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1 text-sm">{a}</span>)}</div><Button variant="ghost" className="mt-4" onClick={() => setResult(null)}>خروج</Button></Card>
        ) : (
          <Card padding="lg"><h3 className="font-bold mb-4">🏪 اختر صالوناً</h3>
            <div className="grid gap-3 sm:grid-cols-3">{list.map((s: Record<string,unknown>) => (
              <button key={s.id as number} onClick={() => enterMut.mutate({ salonId: s.id as number, avatar: 'skin1' }, { onSuccess: (d) => setResult(d as Record<string,unknown>) })} className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 text-center hover:border-purple-400 transition-all">
                <span className="text-4xl">{s.emoji as string}</span><p className="font-bold mt-2">{s.name as string}</p><p className="text-xs text-gray-500">👩‍🎨 {s.technician as string} · ⭐ {s.rating as number} · 👥 {s.visitors as number}</p>
              </button>
            ))}</div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
