'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

export default function FeatureFlagsPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = (api.featureFlags as any).list.useQuery();
  const flags = (data as Array<Record<string, unknown>>) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleMut = (api.featureFlags as any).toggle.useMutation({
    onSuccess: () => { refetch(); addToast('success', 'تم التحديث'); },
    onError: () => addToast('error', 'فشل التحديث'),
  });

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feature Flags</h1>
        {isLoading ? <CardSkeleton /> :
         isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr><th className="p-3 text-right">الميزة</th><th className="p-3 text-right">الحالة</th><th className="p-3 text-right">النسبة</th><th className="p-3 text-right">إجراء</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {flags.map((f) => (
                  <tr key={f.key as string}>
                    <td className="p-3 font-medium">{f.name as string}<br /><span className="text-xs text-gray-400">{f.key as string}</span></td>
                    <td className="p-3"><span className={`rounded px-2 py-0.5 text-xs ${f.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{f.enabled ? 'مفعل' : 'معطل'}</span></td>
                    <td className="p-3 text-gray-500">{f.rolloutPercent as number}%</td>
                    <td className="p-3"><Button size="sm" variant="outline" onClick={() => toggleMut.mutate({ key: f.key, enabled: !f.enabled })}>{f.enabled ? 'تعطيل' : 'تفعيل'}</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
