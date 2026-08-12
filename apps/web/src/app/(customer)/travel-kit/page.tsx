'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TravelKitPage(): JSX.Element {
  const { data: dests } = api.travelKit.destinations.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const [dest, setDest] = useState('beach');
  const [days, setDays] = useState(7);
  const [searchDest, setSearchDest] = useState('');

  const { data: kit, isLoading } = api.travelKit.build.useQuery(
    { destination: searchDest || dest, days },
    { enabled: !!dest },
  ) as { data: Record<string, unknown> | undefined; isLoading: boolean };

  const destinations = (dests ?? []) as Array<Record<string, unknown>>;
  const items = (kit?.items ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">🧳 حقيبة السفر</h1>
          <p className="mt-1 text-sm text-text-secondary">جهزي حقيبة تجميل مثالية لرحلتكِ</p>
        </div>

        <Card padding="lg">
          <div className="flex flex-wrap gap-2 mb-4">
            {destinations.map((d: Record<string, unknown>) => (
              <button
                key={d.key as string}
                onClick={() => {
                  setDest(d.key as string);
                  setSearchDest(d.key as string);
                }}
                className={`rounded-xl px-4 py-3 text-sm transition-all ${dest === d.key ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-muted dark:bg-gray-800'}`}
              >
                {d.nameAr as string}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">المدة:</span>
            <input
              type="range"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="flex-1 accent-brand-600"
            />
            <span className="text-sm font-bold">{days} يوم</span>
          </div>
        </Card>

        {isLoading ? (
          <CardSkeleton />
        ) : kit ? (
          <Card padding="lg">
            <h3 className="font-bold mb-3">🧳 محتويات الحقيبة</h3>
            {(kit.tip as string) ? (
              <div className="mb-4 rounded-lg bg-brand-50 dark:bg-brand-950 p-3 text-sm text-brand-700">
                <span className="font-bold">💡 نصيحة: </span>
                {kit.tip as string}
              </div>
            ) : null}
            <div className="space-y-2">
              {items.map((item: Record<string, unknown>, i: number) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg p-3 ${item.essential ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'bg-surface-muted dark:bg-gray-800'}`}
                >
                  <span className="text-2xl">{item.emoji as string}</span>
                  <div className="flex-1">
                    <span className="font-semibold text-sm">{item.nameAr as string}</span>
                    <span className="text-xs text-text-secondary ml-2">{item.size as string}</span>
                  </div>
                  {item.essential ? (
                    <span className="rounded-full bg-green-200 dark:bg-green-800 px-2 py-0.5 text-xs font-bold">
                      أساسي
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs">
                      اختياري
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
