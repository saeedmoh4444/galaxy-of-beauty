/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, formatCurrency } from '@galaxy/ui';

export default function AdminGiftCardsPage(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.giftCards.listAll.useQuery({
    page: 1,
    limit: 50,
  }) as any;
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🎁 بطاقات الهدية</h1>
      {isLoading ? (
        <CardSkeleton />
      ) : isError ? (
        <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="لا توجد بطاقات" />
      ) : (
        <Card padding="none">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-text-secondary dark:bg-gray-800">
              <tr>
                <th className="p-3 text-right">الكود</th>
                <th className="p-3 text-right">القيمة</th>
                <th className="p-3 text-right">الرصيد</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((c: Record<string, any>) => (
                <tr key={c.id}>
                  <td className="p-3 font-mono font-bold text-brand-600">{c.code}</td>
                  <td className="p-3">{formatCurrency(Number(c.amount))}</td>
                  <td className="p-3">{formatCurrency(Number(c.balance))}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-text-secondary'}`}
                    >
                      {c.status === 'ACTIVE' ? 'نشطة' : 'مستخدمة'}
                    </span>
                  </td>
                  <td className="p-3 text-text-tertiary">
                    {new Date(c.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
