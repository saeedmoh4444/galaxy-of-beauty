'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function NightModePage(): JSX.Element {
  const { data: routine, isLoading: rLoad } = api.nightMode.routine.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const { data: tips } = api.nightMode.tips.useQuery() as { data: string[] | undefined };
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const steps = routine ?? [];
  const allTips = tips ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">🌙 الروتين الليلي</h1>
          <p className="mt-1 text-sm text-text-secondary">
            روتين مسائي للاسترخاء والعناية بالبشرة قبل النوم
          </p>
        </div>

        {rLoad ? (
          <CardSkeleton />
        ) : (
          <Card padding="lg">
            <div className="space-y-1">
              {steps.map((s: Record<string, unknown>, i: number) => {
                const done = checked.has(i);
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-lg p-3 transition-all ${done ? 'bg-green-50 dark:bg-green-950 opacity-70' : 'bg-surface-muted dark:bg-gray-800'}`}
                  >
                    <span className="text-2xl">{s.emoji as string}</span>
                    <span className="text-xs text-text-tertiary w-12">{s.time as string}</span>
                    <div className="flex-1">
                      <span
                        className={`font-medium text-sm ${done ? 'line-through text-text-tertiary' : ''}`}
                      >
                        {s.taskAr as string}
                      </span>
                      <p className="text-[10px] text-text-tertiary">{s.tip as string}</p>
                    </div>
                    <span className="text-xs text-text-tertiary">{s.durationMin as number}د</span>
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => {
                        const n = new Set(checked);
                        n.has(i) ? n.delete(i) : n.add(i);
                        setChecked(n);
                      }}
                      className="h-5 w-5 accent-brand-600 ml-2"
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {allTips.length > 0 && (
          <Card
            padding="lg"
            className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-none"
          >
            <h3 className="font-bold mb-3">💡 نصائح لنوم أفضل</h3>
            <div className="space-y-2">
              {allTips.map((t: string, i: number) => (
                <p key={i} className="text-sm">
                  🌙 {t}
                </p>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
