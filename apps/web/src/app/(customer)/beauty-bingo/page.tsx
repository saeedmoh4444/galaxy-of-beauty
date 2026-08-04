'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyBingoPage(): JSX.Element {
  const { data, isLoading } = api.beautyBingo.card.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const markMut = api.beautyBingo.mark.useMutation();

  const tasks = (data?.tasks ?? []) as Array<Record<string,unknown>>;
  const completed = (data?.completed as number) ?? 0;
  const total = (data?.total as number) ?? 9;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div><h1 className="text-2xl font-bold">🎮 Beauty Bingo</h1><p className="mt-1 text-sm text-text-secondary">أكملي المهام واكسبي جلسة مجانية!</p></div>
        {isLoading ? <CardSkeleton /> : (
          <Card padding="lg" className="text-center">
            <span className="text-5xl">🎮</span><p className="mt-2 font-bold">{completed}/{total} مكتملة</p>
            <p className="text-xs text-brand-600 mt-1">{data?.reward as string}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {tasks.map((t: Record<string,unknown>) => (
                <button key={t.id as number} onClick={() => markMut.mutate({ taskId: t.id as number })} className={`rounded-xl p-3 text-xs font-medium transition-all ${t.completed ? 'bg-green-100 dark:bg-green-900 text-green-700 line-through' : 'bg-surface-muted dark:bg-gray-800 hover:bg-brand-50'}`}>
                  {t.completed ? '✅' : '⬜'} {t.task as string}
                </button>
              ))}
            </div>
          </Card>
        )}
        <div className="text-center"><Button variant="ghost" onClick={() => markMut.mutate({ taskId: 1 })}>🔄 تحديث</Button></div>
      </div>
    </DashboardLayout>
  );
}
