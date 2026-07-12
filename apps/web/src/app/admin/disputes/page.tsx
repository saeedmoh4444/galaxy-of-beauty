'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, Modal } from '@galaxy/shared';

const STATUS_TABS = ['OPEN', 'UNDER_REVIEW', 'RESOLVED_CUSTOMER', 'RESOLVED_TECHNICIAN', 'CLOSED'] as const;

const statusBadge = (status: string): { label: string; className: string } => {
  switch (status) {
    case 'OPEN': return { label: 'مفتوح', className: 'bg-red-100 text-red-700' };
    case 'UNDER_REVIEW': return { label: 'قيد المراجعة', className: 'bg-amber-100 text-amber-700' };
    case 'RESOLVED_CUSTOMER': return { label: 'لصالح العميل', className: 'bg-green-100 text-green-700' };
    case 'RESOLVED_TECHNICIAN': return { label: 'لصالح الفنية', className: 'bg-blue-100 text-blue-700' };
    case 'CLOSED': return { label: 'مغلق', className: 'bg-gray-100 text-gray-700' };
    default: return { label: status, className: 'bg-gray-100 text-gray-700' };
  }
};

export default function AdminDisputesPage(): JSX.Element {
  const [statusTab, setStatusTab] = useState<string>('OPEN');
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [resolveStatus, setResolveStatus] = useState<string>('RESOLVED_CUSTOMER');
  const [resolutionText, setResolutionText] = useState('');

  const { data, isLoading, isError, refetch } = api.disputes.listAdmin.useQuery({ page: 1, limit: 20 } as never);
  const resolveMut = api.disputes.resolve.useMutation({
    onSuccess: () => { refetch(); setResolveOpen(false); setSelected(null); setResolutionText(''); },
  });

  const disputes = (data as unknown as Record<string, unknown>[]) ?? [];

  const filtered = statusTab === 'OPEN'
    ? disputes.filter((d) => (d.status as string) === 'OPEN')
    : disputes.filter((d) => (d.status as string) === statusTab);

  const handleResolve = () => {
    if (!selected) return;
    resolveMut.mutate({
      disputeId: selected.id as number,
      status: resolveStatus,
      resolutionNote: resolutionText,
    } as never);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة النزاعات</h1>
        <p className="text-sm text-gray-500">إجمالي: {disputes.length}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const badge = statusBadge(tab);
          return (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${statusTab === tab ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}
            >
              {badge.label}
            </button>
          );
        })}
      </div>

      {isLoading ? <CardSkeleton />
      : isError ? <ErrorAlert message="فشل تحميل النزاعات" onRetry={() => refetch()} />
      : filtered.length === 0 ? (
        <EmptyState title={`لا توجد نزاعات في حالة "${statusTab === 'OPEN' ? 'مفتوح' : statusTab === 'UNDER_REVIEW' ? 'قيد المراجعة' : statusTab === 'RESOLVED_CUSTOMER' ? 'لصالح العميل' : statusTab === 'RESOLVED_TECHNICIAN' ? 'لصالح الفنية' : 'مغلق'}"`} />
      ) : (
        <div className="space-y-2">
          {filtered.map((d: Record<string, unknown>) => {
            const badge = statusBadge(d.status as string);
            return (
              <Card key={d.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{d.bookingCode as string}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>العميل: {d.customerName as string ?? '—'}</span>
                      <span>السبب: {d.reason as string ?? '—'}</span>
                      <span>{d.createdAt ? new Date(d.createdAt as string).toLocaleDateString('ar-SA') : '—'}</span>
                    </div>
                  </div>
                  {(d.status as string) !== 'CLOSED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => { setSelected(d); setResolveStatus('RESOLVED_CUSTOMER'); setResolutionText(''); setResolveOpen(true); }}
                    >
                      حل النزاع
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resolve Modal */}
      <Modal open={resolveOpen} onClose={() => { setResolveOpen(false); setSelected(null); setResolutionText(''); }} title="حل النزاع">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm"><strong>رمز الحجز:</strong> {selected.bookingCode as string}</p>
            <p className="text-sm"><strong>السبب:</strong> {selected.reason as string}</p>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">نتيجة النزاع</label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                value={resolveStatus}
                onChange={(e) => setResolveStatus(e.target.value)}
              >
                <option value="RESOLVED_CUSTOMER">لصالح العميل</option>
                <option value="RESOLVED_TECHNICIAN">لصالح الفنية</option>
                <option value="CLOSED">إغلاق النزاع</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">تفاصيل الحل</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                rows={4}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="اكتب تفاصيل الحل..."
              />
            </div>

            <div className="flex gap-2">
              <Button variant="primary" onClick={handleResolve} loading={resolveMut.isPending}>تأكيد الحل</Button>
              <Button variant="secondary" onClick={() => { setResolveOpen(false); setSelected(null); }}>إلغاء</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
