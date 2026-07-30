'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function RoutineSchedulerPage(): JSX.Element {
  const { data: routines, isLoading } = api.routineScheduler.myRoutines.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const toggleMut = api.routineScheduler.toggleStep.useMutation();

  const [checked, setChecked] = useState<Set<string>>(new Set());

  const allRoutines = (routines ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div><h1 className="text-2xl font-bold">📅 جدول الروتين</h1><p className="mt-1 text-sm text-gray-500">نظمي روتين العناية اليومي والأسبوعي</p></div>

        {isLoading ? <div className="space-y-4">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
          allRoutines.map((r: Record<string,unknown>) => (
            <Card key={r.id as string} padding="lg">
              <h3 className="font-bold text-lg mb-4">{r.nameAr as string}</h3>
              <div className="space-y-1">{(r.steps as Array<Record<string,unknown>>).map((s: Record<string,unknown>, i: number) => {
                const key = `${r.id}_${i}`;
                const done = checked.has(key);
                return (
                  <div key={i} className={`flex items-center gap-3 rounded-lg p-3 transition-all ${done ? 'bg-green-50 dark:bg-green-950' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <span className="text-2xl">{s.emoji as string}</span>
                    <span className="text-xs text-gray-400 w-14">{s.time as string}</span>
                    <span className={`flex-1 font-medium text-sm ${done ? 'line-through text-gray-400' : ''}`}>{s.task as string}</span>
                    <input type="checkbox" checked={done} onChange={() => { const next = new Set(checked); next.has(key) ? next.delete(key) : next.add(key); setChecked(next); toggleMut.mutate({ routineId: r.id as string, stepIndex: i }); }} className="h-5 w-5 accent-brand-600" />
                  </div>
                );
              })}</div>
            </Card>
          ))
        }
      </div>
    </DashboardLayout>
  );
}
