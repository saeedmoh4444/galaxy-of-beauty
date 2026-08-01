'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminLoyaltyPage(): JSX.Element {
  const { data: rewards, isLoading: rwLoading } = api.loyalty.listRewards.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-5xl space-y-6">
        <div><h1 className="text-2xl font-bold">🏆 إدارة الولاء</h1><p className="mt-1 text-sm text-gray-500">برامج الولاء والمكافآت</p></div>

        <div>
          <Card padding="lg"><h3 className="font-bold mb-3">🎁 المكافآت المتاحة</h3>
            {rwLoading ? <CardSkeleton/> : !(rewards??[]).length ? <p className="text-sm text-gray-400">لا توجد مكافآت</p> :
              <div className="space-y-2">{(rewards??[]).map((r: Record<string,unknown>) => (
                <div key={r.id as number} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="font-bold text-sm">{r.nameAr as string ?? (r.nameJson as Record<string,string>)?.ar}</p><p className="text-xs text-gray-500">{r.descriptionAr as string ?? ''}</p></div>
                  <span className="font-bold text-amber-600">{r.pointsCost as number} نقطة</span>
                </div>
              ))}</div>
            }
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
