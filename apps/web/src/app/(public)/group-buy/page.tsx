'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';

export default function GroupBuyPage(): JSX.Element {
  const { user } = useAuth();
  const { data, isLoading } = api.groupBuy.deals.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const joinMut = api.groupBuy.join.useMutation();
  const deals = data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">🛒</span><h1 className="mt-4 text-3xl font-bold">صفقات المجموعة</h1><p className="mt-2 text-text-secondary">انضمي لمجموعة ووفري أكثر!</p></div>
      {isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{deals.map((d: Record<string,unknown>) => (
          <Card key={d.id as number} padding="lg" className="text-center border-2 border-amber-200 dark:border-amber-800">
            <span className="text-4xl">{d.emoji as string}</span>
            <h3 className="font-bold mt-2">{d.service as string}</h3>
            <div className="mt-2"><span className="text-text-tertiary line-through">{formatCurrency(d.originalPrice as number)}</span><span className="text-2xl font-extrabold text-green-600 ml-2">{formatCurrency(d.groupPrice as number)} ر.س</span></div>
            <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-2 rounded-full bg-brand-500" style={{ width: `${((d.currentBuyers as number) / (d.minBuyers as number)) * 100}%` }} /></div>
            <p className="text-xs text-text-secondary mt-1">{d.currentBuyers as number}/{d.minBuyers as number} مشتركة · ⏰ {d.endsIn as string}</p>
            {user && <Button size="sm" className="mt-3" onClick={() => joinMut.mutate({ dealId: d.id as number })}>🛒 انضمي ووفري {formatCurrency(d.savings as number)}</Button>}
          </Card>
        ))}</div>
      }
    </div>
  );
}
