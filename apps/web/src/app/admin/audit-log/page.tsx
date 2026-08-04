'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Input, Button, Pagination, PageContainer } from '@galaxy/ui';

const ACTION_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'LOGIN_SUCCESS', label: '🔑 تسجيل دخول' },
  { value: 'SUSPEND_USER', label: '🚫 تعليق مستخدم' },
  { value: 'VERIFY_KYC', label: '✅ توثيق فنية' },
  { value: 'UPDATE_CATEGORY', label: '📂 تعديل قسم' },
  { value: 'UPDATE_SERVICE', label: '💄 تعديل خدمة' },
  { value: 'CREATE_PROMO', label: '🏷️ إنشاء كود خصم' },
  { value: 'REFUND_PAYMENT', label: '💰 استرداد مبلغ' },
  { value: 'MAINTENANCE_MODE', label: '🔧 وضع الصيانة' },
  { value: 'FEATURE_FLAG_CHANGED', label: '🚩 تغيير خاصية' },
];

export default function AuditLogPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');

  const input = {
    page,
    limit: 20,
    action: actionFilter || undefined,
    targetType: targetFilter || undefined,
    adminId: adminFilter ? Number(adminFilter) : undefined,
  };

  const { data, isLoading, isError, refetch } = (api as any).admin.auditLogs?.useQuery?.(input) ?? {
    data: undefined, isLoading: false, isError: false, refetch: () => {},
  };

  const logs: Array<Record<string, unknown>> = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <PageContainer width="wide">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">📋 سجل التدقيق</h1>
          <p className="mt-1 text-sm text-text-secondary">جميع إجراءات المشرفين في المنصة</p>
        </div>

        {/* Filters */}
        <Card padding="md">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">الإجراء</label>
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-edge bg-surface px-3 py-2 text-sm"
              >
                {ACTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="نوع الهدف"
              placeholder="مثال: User, Booking"
              value={targetFilter}
              onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }}
            />
            <Input
              label="رقم المشرف"
              placeholder="Admin ID"
              value={adminFilter}
              onChange={(e) => { setAdminFilter(e.target.value); setPage(1); }}
            />
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={() => { setActionFilter(''); setTargetFilter(''); setAdminFilter(''); setPage(1); }}>
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </Card>

        {/* Logs Table */}
        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل تحميل سجل التدقيق" onRetry={() => refetch()} />
        ) : logs.length === 0 ? (
          <EmptyState title="لا توجد سجلات" description="لم يتم تسجيل أي إجراءات إدارية بعد" />
        ) : (
          <>
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-edge bg-surface-muted text-xs text-text-secondary">
                    <tr>
                      <th className="px-4 py-3 text-right">#</th>
                      <th className="px-4 py-3 text-right">الإجراء</th>
                      <th className="px-4 py-3 text-right">النوع</th>
                      <th className="px-4 py-3 text-right">الهدف</th>
                      <th className="px-4 py-3 text-right">المشرف</th>
                      <th className="px-4 py-3 text-right">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-edge-muted">
                    {logs.map((log, i) => (
                      <tr key={i} className="hover:bg-surface-muted transition-colors">
                        <td className="px-4 py-2.5 text-text-tertiary">{log.id as number}</td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            (log.action as string)?.startsWith('ERROR_')
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {log.action as string}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-text-secondary">{log.targetType as string}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{log.targetId as string}</td>
                        <td className="px-4 py-2.5 text-text-secondary">#{log.adminId as number}</td>
                        <td className="px-4 py-2.5 text-xs text-text-tertiary" dir="ltr">
                          {new Date(log.createdAt as string).toLocaleString('ar-SA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
