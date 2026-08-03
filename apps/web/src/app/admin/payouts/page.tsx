'use client';

import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

type PayoutItem = NonNullable<RouterOutput['payouts']['listForAdmin']>['payouts'][number];

export default function PayoutsPage(): JSX.Element {
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = api.payouts.listForAdmin.useQuery({});
  const items: PayoutItem[] = data?.payouts ?? [];
  const processMut = api.payouts.process.useMutation({
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
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">المدفوعات للفنيات</h1>
        {isLoading ? <CardSkeleton /> :
         isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> :
         items.length === 0 ? <EmptyState title="لا توجد مدفوعات" /> : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-text-secondary dark:bg-gray-800 dark:text-gray-400">
                <tr><th className="p-3 text-right">الفنية</th><th className="p-3 text-right">المبلغ</th><th className="p-3 text-right">الحالة</th><th className="p-3 text-right">التاريخ</th><th className="p-3 text-right">إجراء</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((p: PayoutItem) => (
                  <tr key={p.id}>
                    <td className="p-3 font-medium">{p.technician?.name ?? '-'}</td>
                    <td className="p-3 font-bold">{formatCurrency(Number(p.amount ?? 0))}</td>
                    <td className="p-3">{statusBadge(p.status)}</td>
                    <td className="p-3 text-text-tertiary">{new Date(p.createdAt).toLocaleDateString('ar-SA')}</td>
                    <td className="p-3">{p.status === 'PENDING' ? <Button size="sm" onClick={() => processMut.mutate({ payoutId: p.id })}>معالجة</Button> : null}</td>
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
