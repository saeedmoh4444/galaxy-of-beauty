'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

export default function PayoutsPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = (api.payouts as any).list.useQuery({});
  const items = (data as Record<string, unknown>)?.items as Array<Record<string, unknown>> || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processMut = (api.payouts as any).processPayout.useMutation({
    onSuccess: () => { refetch(); addToast('success', 'تمت معالجة الدفع'); },
    onError: () => addToast('error', 'فشلت المعالجة'),
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { PENDING: 'bg-yellow-100 text-yellow-700', PROCESSING: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-green-100 text-green-700', FAILED: 'bg-red-100 text-red-700' };
    const labels: Record<string, string> = { PENDING: 'معلق', PROCESSING: 'قيد المعالجة', COMPLETED: 'مكتمل', FAILED: 'فشل' };
    return <span className={`rounded px-2 py-0.5 text-xs ${map[s] || ''}`}>{labels[s] || s}</span>;
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">المدفوعات للفنيات</h1>
        {isLoading ? <CardSkeleton /> :
         isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> :
         items.length === 0 ? <EmptyState title="لا توجد مدفوعات" /> : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr><th className="p-3 text-right">الفنية</th><th className="p-3 text-right">المبلغ</th><th className="p-3 text-right">الحالة</th><th className="p-3 text-right">التاريخ</th><th className="p-3 text-right">إجراء</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((p) => (
                  <tr key={p.id as number}>
                    <td className="p-3 font-medium">{(p.user as Record<string, string>)?.name || '-'}</td>
                    <td className="p-3 font-bold">{formatCurrency(Number(p.amount || 0))}</td>
                    <td className="p-3">{statusBadge(p.status as string)}</td>
                    <td className="p-3 text-gray-400">{new Date(p.createdAt as string).toLocaleDateString('ar-SA')}</td>
                    <td className="p-3">{p.status === 'PENDING' ? <Button size="sm" onClick={() => processMut.mutate({ id: p.id })}>معالجة</Button> : null}</td>
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
