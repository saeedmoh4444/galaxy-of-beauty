'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function VIPMembershipPage(): JSX.Element {
  const { data: tiers, isLoading } = api.vipMembership.tiers.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const { data: myTier } = api.vipMembership.myTier.useQuery() as { data: Record<string,unknown> | undefined };
  const upgradeMut = api.vipMembership.upgrade.useMutation();

  const allTiers = tiers ?? [];
  const current = (myTier?.currentTier as string) ?? 'silver';

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <span className="text-6xl">💎</span>
          <h1 className="mt-4 text-3xl font-bold">عضوية VIP</h1>
          <p className="mt-2 text-gray-500">ارتقِ بعضويتكِ واحصلي على مميزات حصرية</p>
          {current !== 'silver' && <p className="mt-2 text-brand-600 font-bold">عضوية {current === 'gold' ? '🥇 ذهبية' : '💎 بلاتينية'} نشطة</p>}
        </div>

        {isLoading ? <div className="grid gap-6 lg:grid-cols-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div>
        : allTiers.length === 0 ? <ErrorAlert message="لا توجد بيانات" />
        : <div className="grid gap-6 lg:grid-cols-3">
            {allTiers.map((t: Record<string,unknown>) => {
              const isCurrent = current === (t.key as string);
              const benefits = (t.benefits as string[]) ?? [];
              return (
                <Card key={t.key as string} padding="lg" className={`relative text-center ${isCurrent ? 'border-2 border-brand-400 ring-2 ring-brand-100 dark:ring-brand-900' : ''}`}>
                  {isCurrent && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-0.5 text-xs font-bold text-white">حالية</span>}
                  <span className="text-5xl">{t.emoji as string}</span>
                  <h2 className="mt-2 text-xl font-extrabold">{t.nameAr as string}</h2>
                  <p className="mt-3 text-3xl font-extrabold text-brand-600">{(t.price as number) > 0 ? formatCurrency(t.price as number) + ' ر.س' : 'مجاناً'}<span className="text-xs text-gray-400 font-normal"> / سنة</span></p>
                  <ul className="mt-4 space-y-2 text-right">
                    {benefits.map((b: string, i: number) => <li key={i} className="flex items-center gap-2 text-sm"><span className="text-brand-500">✓</span> <span className="text-gray-700 dark:text-gray-300">{b}</span></li>)}
                  </ul>
                  <div className="mt-6">
                    {isCurrent ? (
                      <span className="rounded-full bg-green-100 dark:bg-green-900 px-4 py-2 text-sm font-bold text-green-700 dark:text-green-300">عضوية نشطة</span>
                    ) : (t.price as number) > 0 ? (
                      <Button onClick={() => upgradeMut.mutate({ tier: (t.key as string) as 'silver' | 'gold' | 'platinum' })} loading={upgradeMut.isPending} className="w-full">✨ ترقية</Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        }
      </div>
    </DashboardLayout>
  );
}
