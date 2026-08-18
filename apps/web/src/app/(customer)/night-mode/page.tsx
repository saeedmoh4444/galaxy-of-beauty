'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function NightModePage(): JSX.Element {
  const { t } = useLocale();
  const { data: routine, isLoading: rLoad } = api.nightMode.routine.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const { data: tips } = api.nightMode.tips.useQuery() as { data: string[] | undefined };
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const steps = routine ?? [];
  const allTips = tips ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('nightMode.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('nightMode.subtitle')}</p>
        </div>

        {rLoad ? (
          <CardListSkeleton count={4} />
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
                    <span className="text-xs text-text-tertiary">
                      {t('nightMode.minutes', { count: s.durationMin as number })}
                    </span>
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => {
                        const n = new Set(checked);
                        if (n.has(i)) {
                          n.delete(i);
                        } else {
                          n.add(i);
                        }
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
            <h3 className="font-bold mb-3">{t('nightMode.tipsTitle')}</h3>
            <div className="space-y-2">
              {allTips.map((tip: string, i: number) => (
                <p key={i} className="text-sm">
                  {tip}
                </p>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
