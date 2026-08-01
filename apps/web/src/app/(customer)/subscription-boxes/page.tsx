'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SubscriptionBoxesPage(): JSX.Element {
  const { data: subscriptions, isLoading: subLoading } = api.subscriptionBoxes.mySubscriptions.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const { data: plans } = api.subscriptionBoxes.plans.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const subscribeMut = api.subscriptionBoxes.subscribe.useMutation();
  const cancelMut = api.subscriptionBoxes.cancel.useMutation();

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">📦 صناديق الاشتراك</h1><p className="mt-1 text-sm text-gray-500">صناديق تجميل شهرية تصلك لباب بيتكِ</p></div>

        {subLoading ? <CardSkeleton/> : (subscriptions??[]).length > 0 && <Card padding="lg"><h3 className="font-bold mb-3">📋 اشتراكاتي</h3>
          <div className="space-y-2">{(subscriptions??[]).map((s: Record<string,unknown>) => {
            const plan = s.plan as Record<string,unknown> | undefined;
            return (
              <div key={s.id as number} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div><p className="font-bold">{(plan?.nameJson as Record<string,string>)?.ar}</p><p className="text-xs text-gray-500">{new Date(s.currentPeriodEnd as string).toLocaleDateString('ar-SA')} · {s.status as string}</p></div>
                  <Button size="sm" variant="ghost" onClick={() => cancelMut.mutate({ id: s.id as number })} loading={cancelMut.isPending} className="text-red-500">إلغاء</Button>
                </div>
              </div>
            );
          })}</div>
        </Card>}

        <div className="grid gap-6 lg:grid-cols-3">{(plans??[]).map((p: Record<string,unknown>) => (
          <Card key={p.id as number} padding="lg" className="text-center">
            <span className="text-5xl">📦</span>
            <h3 className="font-bold text-lg mt-3">{(p.nameJson as Record<string,string>)?.ar}</h3>
            <p className="text-xs text-gray-500 mt-1">{(p.descriptionJson as Record<string,string>)?.ar ?? ''}</p>
            <p className="text-2xl font-extrabold mt-2">{formatCurrency(Number(p.price ?? 0))}<span className="text-sm font-normal text-gray-500"> / {p.interval === 'MONTHLY' ? 'شهرياً' : p.interval === 'WEEKLY' ? 'أسبوعياً' : 'كل أسبوعين'}</span></p>
            <p className="text-sm text-gray-500 mt-1">{p.servicesPerMonth as number} خدمات شهرياً</p>
            {p.discountPercent as number > 0 && <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 mt-2">خصم {p.discountPercent as number}%</span>}
            <Button onClick={() => subscribeMut.mutate({ planId: p.id as number })} loading={subscribeMut.isPending} className="w-full mt-3">اشتراك</Button>
          </Card>
        ))}</div>
      </div>
    </DashboardLayout>
  );
}
