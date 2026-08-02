'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BookingChecklistPage(): JSX.Element {
  const [category, setCategory] = useState('makeup');
  const { data: cats } = api.bookingChecklist.categories.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data, isLoading } = api.bookingChecklist.get.useQuery({ category }) as { data: Record<string,unknown> | undefined; isLoading: boolean };

  const categories = (cats ?? []) as Array<Record<string,unknown>>;
  const items = (data?.items ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div><h1 className="text-2xl font-bold">📋 قائمة التحضير</h1><p className="mt-1 text-sm text-gray-500">كل ما تحتاجينه قبل موعدكِ</p></div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c: Record<string,unknown>) => (
            <button key={c.key as string} onClick={() => setCategory(c.key as string)} className={`rounded-full px-4 py-2 text-sm font-medium ${category === c.key ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{c.emoji as string} {c.nameAr as string}</button>
          ))}
        </div>

        {isLoading ? <CardSkeleton /> : (
          <Card padding="lg">
            <div className="space-y-4">
              {items.map((item: Record<string,unknown>, i: number) => (
                <div key={i} className="flex items-center gap-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                  <span className="text-3xl">{item.emoji as string}</span>
                  <div>
                    <p className="font-semibold">{item.textAr as string}</p>
                    <p className="text-xs text-gray-500">{item.textEn as string}</p>
                  </div>
                  <input type="checkbox" className="ml-auto h-5 w-5 accent-brand-600" />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
