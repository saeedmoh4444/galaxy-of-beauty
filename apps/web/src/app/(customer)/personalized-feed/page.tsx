'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PersonalizedFeedPage(): JSX.Element {
  const { data, isLoading } = api.personalizedFeed.feed.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const items = (data?.items ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div><h1 className="text-2xl font-bold">🎯 خلاصتي</h1><p className="mt-1 text-sm text-text-secondary">محتوى مخصص لكِ بناءً على اهتماماتكِ</p></div>
        {isLoading ? <div className="space-y-3">{Array.from({length:6},(_,i)=><CardSkeleton key={i}/>)}</div> :
          <div className="space-y-3">{items.map((item: Record<string,unknown>) => (
            <Card key={item.id as number} padding="md" className="flex items-center gap-4 hover:shadow-md transition-all">
              <span className="text-3xl">{item.emoji as string}</span>
              <div className="flex-1"><p className="font-bold text-sm">{item.title as string}</p><p className="text-xs text-text-secondary">{item.technician ? `👩‍🎨 ${item.technician}` : item.brand ? `🏷️ ${item.brand}` : `💰 ${item.price as number} ر.س`}</p></div>
              <span className="rounded-full bg-brand-100 dark:bg-brand-900 px-2 py-0.5 text-xs font-bold text-brand-700">{item.relevance as number}%</span>
            </Card>
          ))}</div>
        }
      </div>
    </DashboardLayout>
  );
}
