'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const TYPE_LABELS: Record<string,string> = { workshop: '🎓 ورشة عمل', masterclass: '👑 ماستر كلاس', launch: '🚀 إطلاق', seasonal: '🌸 موسمي' };

export default function BeautyEventsPage(): JSX.Element {
  const { data: events, isLoading } = api.beautyEvents.upcoming.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const { data: myRegs } = api.beautyEvents.myRegistrations.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const registerMut = api.beautyEvents.register.useMutation();
  const cancelMut = api.beautyEvents.cancelRegistration.useMutation();
  const registeredIds = new Set((myRegs ?? []).map((r: Record<string,unknown>) => r.eventId as number));

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">🎪 فعاليات وورش</h1><p className="mt-1 text-sm text-gray-500">سجلي في ورش العمل والفعاليات الحصرية</p></div>

        {(myRegs as Array<Record<string,unknown>>)?.length > 0 && <Card padding="lg"><h3 className="font-bold mb-3">✅ مسجلة في {(myRegs as Array<Record<string,unknown>>).length} فعاليات</h3>
          <div className="flex flex-wrap gap-2">{(myRegs as Array<Record<string,unknown>>).map((r: Record<string,unknown>) => {
            const e = r.event as Record<string,unknown> | undefined;
            return <span key={r.id as number} className="rounded-full bg-green-100 px-3 py-1 text-sm">{(e?.nameJson as Record<string,string>)?.ar}</span>;
          })}</div>
        </Card>}

        {isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6},(_,i)=><CardSkeleton key={i}/>)}</div> :
          !(events??[]).length ? <Card padding="lg" className="text-center py-8"><p className="text-4xl mb-2">🎪</p><p className="text-gray-500">لا توجد فعاليات قادمة</p></Card> :
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(events??[]).map((e: Record<string,unknown>) => {
            const isRegistered = registeredIds.has(e.id as number);
            return (
              <Card key={e.id as number} padding="lg" className="text-center">
                <span className="text-4xl">{TYPE_LABELS[e.eventType as string]?.split(' ')[0] ?? '🎪'}</span>
                <h3 className="font-bold mt-3">{(e.nameJson as Record<string,string>)?.ar}</h3>
                <p className="text-xs text-gray-500 mt-1">{TYPE_LABELS[e.eventType as string]}</p>
                <p className="text-xs text-gray-500">{e.location as string} · {new Date(e.startsAt as string).toLocaleDateString('ar-SA',{day:'numeric',month:'long'})}</p>
                <p className="text-lg font-extrabold text-brand-600 mt-2">{e.price ? formatCurrency(e.price as number) : 'مجانية'}</p>
                <Button size="sm" onClick={() => isRegistered ? cancelMut.mutate({ eventId: e.id as number }) : registerMut.mutate({ eventId: e.id as number })} loading={registerMut.isPending || cancelMut.isPending} variant={isRegistered ? 'outline' : 'primary'} className="w-full mt-3">{isRegistered ? '✅ مسجلة — إلغاء' : '📝 سجلي الآن'}</Button>
                {e.maxAttendees && <p className="text-xs text-gray-400 mt-1">المقاعد: {e.maxAttendees as number}</p>}
              </Card>
            );
          })}</div>
        }
      </div>
    </DashboardLayout>
  );
}
