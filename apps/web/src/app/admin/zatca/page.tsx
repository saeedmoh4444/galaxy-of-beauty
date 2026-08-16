'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import {
  Button,
  Card,
  CardListSkeleton,
  ErrorAlert,
  EmptyState,
  Input,
  Modal,
  formatCurrency,
} from '@galaxy/ui';

const STATUS_TABS = ['PENDING', 'REPORTED', 'CLEARED', 'REJECTED'] as const;

type InvoiceItem = NonNullable<RouterOutput['zatca']['listInvoices']>['items'][number];

const statusBadge = (status: string): { label: string; className: string } => {
  switch (status) {
    case 'PENDING':
      return { label: 'قيد الانتظار', className: 'bg-amber-100 text-amber-700' };
    case 'REPORTED':
      return { label: 'مبلغ', className: 'bg-blue-100 text-blue-700' };
    case 'CLEARED':
      return { label: 'مقبول', className: 'bg-green-100 text-green-700' };
    case 'REJECTED':
      return { label: 'مرفوض', className: 'bg-red-100 text-red-700' };
    default:
      return { label: status, className: 'bg-surface-muted text-text-primary' };
  }
};

export default function AdminZatcaPage(): JSX.Element {
  const [statusTab, setStatusTab] = useState<string>('PENDING');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const { data, isLoading, isError, refetch } = api.zatca.listInvoices.useQuery({
    page: 1,
    limit: 20,
  });
  const generateMut = api.zatca.generateInvoice.useMutation({
    onSuccess: () => {
      refetch();
      setGenerateOpen(false);
      setBookingId('');
    },
  });
  const reportMut = api.zatca.reportInvoice.useMutation({ onSuccess: () => refetch() });

  const invoices = data?.items ?? [];

  const filtered = invoices.filter((inv) => inv.status === statusTab);

  const handleGenerate = () => {
    if (!bookingId) return;
    generateMut.mutate({ bookingId: Number(bookingId) });
  };

  const handleReport = (invoice: InvoiceItem) => {
    reportMut.mutate({ invoiceId: invoice.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الفاتورة الإلكترونية (ZATCA)</h1>
        <Button
          variant="primary"
          onClick={() => {
            setBookingId('');
            setGenerateOpen(true);
          }}
        >
          إصدار فاتورة
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const badge = statusBadge(tab);
          return (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${statusTab === tab ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800 dark:text-gray-300'}`}
            >
              {badge.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message="فشل تحميل الفواتير" onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`لا توجد فواتير في حالة "${statusTab === 'PENDING' ? 'قيد الانتظار' : statusTab === 'REPORTED' ? 'مبلغ' : statusTab === 'CLEARED' ? 'مقبول' : 'مرفوض'}"`}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((inv: InvoiceItem) => {
            const badge = statusBadge(inv.status);
            return (
              <Card key={inv.id} padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">فاتورة #{String(inv.invoiceNumber ?? inv.id)}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-text-secondary">
                      <span>الحجز: {inv.booking?.bookingCode ?? '—'}</span>
                      <span>{formatCurrency(Number(inv.booking?.totalAmount ?? 0))}</span>
                      <span>
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-SA') : '—'}
                      </span>
                    </div>
                  </div>
                  {inv.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleReport(inv)}
                      loading={reportMut.isPending}
                    >
                      إبلاغ
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Generate Invoice Modal */}
      <Modal
        open={generateOpen}
        onClose={() => {
          setGenerateOpen(false);
          setBookingId('');
        }}
        title="إصدار فاتورة جديدة"
      >
        <div className="space-y-4">
          <Input
            label="رقم الحجز"
            type="number"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="أدخل رقم الحجز"
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleGenerate} loading={generateMut.isPending}>
              إصدار
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setGenerateOpen(false);
                setBookingId('');
              }}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
