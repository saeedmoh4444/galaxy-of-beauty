'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SaleAlertsPage(): JSX.Element {
  const { data: cats } = api.saleAlerts.categories.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data: alerts, isLoading, isError, refetch } = api.saleAlerts.myAlerts.useQuery() as {
    data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void;
  };
  const { data: deals } = api.saleAlerts.activeDeals.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const createMut = api.saleAlerts.create.useMutation({ onSuccess: () => { setShowAdd(false); setSelectedCats([]); refetch(); } });
  const toggleMut = api.saleAlerts.toggle.useMutation({ onSuccess: () => refetch() });
  const deleteMut = api.saleAlerts.delete.useMutation({ onSuccess: () => refetch() });

  const [showAdd, setShowAdd] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [maxDiscount, setMaxDiscount] = useState(30);

  const categories = (cats ?? []) as Array<Record<string,unknown>>;
  const myAlerts = (alerts ?? []) as Array<Record<string,unknown>>;
  const activeDeals = (deals ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">🛒 تنبيهات العروض</h1><p className="mt-1 text-sm text-text-secondary">اشتركي في تنبيهات العروض ولا يفوتكِ أي خصم</p></div>
          <Button onClick={() => setShowAdd(true)}>+ تنبيه جديد</Button>
        </div>

        {/* Active Deals */}
        {activeDeals.length > 0 && (
          <Card padding="lg" className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-none">
            <h3 className="font-bold mb-3">⚡ عروض نشطة الآن</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {activeDeals.map((d: Record<string,unknown>) => (
                <div key={d.id as number} className="rounded-xl bg-white dark:bg-gray-800 p-3 text-center">
                  <span className="text-2xl">{d.emoji as string}</span>
                  <p className="font-bold text-sm mt-1">{d.titleAr as string}</p>
                  <p className="text-xs text-red-500 font-bold mt-1">-{d.discount as number}%</p>
                  <p className="text-[10px] text-text-tertiary">⏰ ينتهي خلال {d.endsIn as string}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* My Alerts */}
        {isLoading ? <CardSkeleton /> :
         isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> :
         myAlerts.length === 0 ? <EmptyState title="لا توجد تنبيهات" description="أنشئي تنبيهاً لتلقي إشعارات عند توفر عروض" action={{ label: 'إنشاء تنبيه', onPress: () => setShowAdd(true) }} /> :
         <div className="space-y-3">
           {myAlerts.map((a: Record<string,unknown>) => (
             <Card key={a.id as number} padding="md" className="flex items-center justify-between">
               <div>
                 <div className="flex flex-wrap gap-1">{(a.categories as string[])?.map((c: string) => { const cat = categories.find((x) => x.key === c); return <span key={c} className="rounded-full bg-surface-muted dark:bg-gray-800 px-2 py-0.5 text-xs">{cat?.emoji as string} {cat?.nameAr as string}</span>; })}</div>
                 <p className="text-xs text-text-secondary mt-1">خصم من {a.maxDiscount as number}% وأكثر</p>
               </div>
               <div className="flex items-center gap-2">
                 <button onClick={() => toggleMut.mutate({ id: a.id as number })} className={`text-sm ${a.active ? 'text-green-500' : 'text-text-tertiary'}`}>{a.active ? '🟢' : '⚫'}</button>
                 <button onClick={() => deleteMut.mutate({ id: a.id as number })} className="text-red-400 text-sm">🗑️</button>
               </div>
             </Card>
           ))}
         </div>
        }

        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="تنبيه جديد">
          <div className="space-y-3">
            <div><label className="text-sm font-semibold mb-2 block">الفئات</label><div className="flex flex-wrap gap-2">{categories.filter((c: Record<string,unknown>) => c.key !== 'all').map((c: Record<string,unknown>) => (
              <button key={c.key as string} onClick={() => setSelectedCats((p) => p.includes(c.key as string) ? p.filter((x) => x !== c.key) : [...p, c.key as string])} className={`rounded-full px-3 py-1.5 text-xs font-medium ${selectedCats.includes(c.key as string) ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800'}`}>
                {c.emoji as string} {c.nameAr as string}
              </button>
            ))}</div></div>
            <div><label className="text-sm font-semibold">الحد الأدنى للخصم: {maxDiscount}%</label><input type="range" min={10} max={80} step={5} value={maxDiscount} onChange={(e) => setMaxDiscount(parseInt(e.target.value))} className="w-full accent-brand-600 mt-1" /></div>
            <Button onClick={() => { if (selectedCats.length > 0) createMut.mutate({ categories: selectedCats, maxDiscount }); }} loading={createMut.isPending} className="w-full">🔔 تفعيل التنبيه</Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
