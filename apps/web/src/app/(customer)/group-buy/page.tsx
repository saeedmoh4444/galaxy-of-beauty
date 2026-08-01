'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function GroupBuyPage(): JSX.Element {
  const { data: deals, isLoading } = api.groupBuy.deals.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const joinMut = api.groupBuy.join.useMutation();

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">👯‍♀️ شراء جماعي</h1><p className="mt-1 text-sm text-gray-500">كل ما زاد العدد، قل السعر!</p></div>

        {isLoading ? <div className="space-y-4">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
          !(deals??[]).length ? <Card padding="lg" className="text-center py-8"><p className="text-gray-500">لا توجد صفقات جماعية حالياً</p></Card> :
          <div className="space-y-4">{(deals??[]).map((d: Record<string,unknown>) => {
            const pct = Math.round(((d.currentBuyers as number) / (d.minBuyers as number)) * 100);
            const isReady = (d.currentBuyers as number) >= (d.minBuyers as number);
            return (
              <Card key={d.id as number} padding="lg">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{d.emoji as string}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{d.service as string}</h3>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-gray-400 line-through">{formatCurrency(d.originalPrice as number)}</span>
                      <span className="text-2xl font-extrabold text-green-600">{formatCurrency(d.groupPrice as number)}</span>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">وفر {formatCurrency(d.savings as number)}</span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{d.currentBuyers as number} / {d.minBuyers as number} مشتركة</span><span>⏱️ {d.endsIn as string}</span></div>
                      <div className="h-3 bg-gray-100 rounded-full"><div className={`h-3 rounded-full ${isReady?'bg-green-500':'bg-brand-600'}`} style={{width:`${Math.min(100,pct)}%`}}/></div>
                    </div>
                    <Button onClick={() => joinMut.mutate({ dealId: d.id as number })} loading={joinMut.isPending} className="w-full mt-3">{isReady ? '🎉 انضمي الآن' : '👯‍♀️ انضمي للمجموعة'}</Button>
                  </div>
                </div>
              </Card>
            );
          })}</div>
        }
      </div>
    </DashboardLayout>
  );
}
