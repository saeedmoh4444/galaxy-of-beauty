'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function GeofenceOffersPage(): JSX.Element {
  const { data: offers, isLoading } = (api as any).geofenceOffers.nearby.useQuery({ city: 'الرياض' }) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const optInMut = (api as any).geofenceOffers.optIn.useMutation();

  const items = offers ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div><h1 className="text-2xl font-bold">📍 عروض بالقرب منك</h1><p className="mt-1 text-sm text-text-secondary">عروض حصرية من الصالونات القريبة من موقعك</p></div>

        <Button onClick={() => optInMut.mutate()} loading={optInMut.isPending} className="w-full">🔔 فعلي التنبيهات القريبة</Button>

        {isLoading ? <div className="space-y-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
          <div className="space-y-3">{items.map((o: Record<string,unknown>) => (
            <Card key={o.id as number} padding="lg" className="flex items-center gap-4 hover:shadow-md transition-all">
              <span className="text-4xl">{o.emoji as string}</span>
              <div className="flex-1"><h3 className="font-bold">{o.titleAr as string}</h3><p className="text-xs text-text-secondary">{o.salonName as string} · {o.distance as string} · {o.city as string}</p></div>
              <div className="text-right"><span className="rounded-full bg-red-100 dark:bg-red-900 px-2.5 py-0.5 text-xs font-bold text-red-700">⏰ {o.expiresIn as string}</span></div>
            </Card>
          ))}</div>
        }
      </div>
    </DashboardLayout>
  );
}
