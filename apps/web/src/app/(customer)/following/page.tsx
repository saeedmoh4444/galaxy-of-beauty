'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function FollowingPage(): JSX.Element {
  const { data, isLoading } = api.technicianFollows.myFollows.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const unfollowMut = api.technicianFollows.unfollow.useMutation();
  const follows = data ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">👩‍🎨 متابعة الفنيات</h1><p className="mt-1 text-sm text-gray-500">الفنيات اللي تتابعينهم</p></div>

        {isLoading ? <div className="space-y-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
          follows.length === 0 ? <Card padding="lg" className="text-center py-8"><p className="text-4xl mb-2">👩‍🎨</p><p className="text-gray-500">مافي فنيات متابعات بعد</p></Card> :
          <div className="space-y-3">{follows.map((f: Record<string,unknown>) => (
            <Card key={f.id as number} padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👩‍🎨</span>
                  <div>
                    <p className="font-bold">فنية #{f.technicianId as number}</p>
                    <p className="text-xs text-gray-500">تمت المتابعة {new Date(f.createdAt as string).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => unfollowMut.mutate({ technicianId: f.technicianId as number })} loading={unfollowMut.isPending} className="text-red-500">إلغاء المتابعة</Button>
              </div>
            </Card>
          ))}</div>
        }
      </div>
    </DashboardLayout>
  );
}
