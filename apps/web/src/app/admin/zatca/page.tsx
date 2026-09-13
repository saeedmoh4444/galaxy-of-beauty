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
  useAuth,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { type TranslationKey } from '@galaxy/shared';

const STATUS_TABS = ['PENDING', 'REPORTED', 'CLEARED', 'REJECTED'] as const;

type InvoiceItem = NonNullable<RouterOutput['zatca']['listInvoices']>['items'][number];

const statusBadge = (status: string): { labelKey: TranslationKey; className: string } => {
  switch (status) {
    case 'PENDING':
      return { labelKey: 'admin.zatca.status-pending', className: 'bg-amber-100 text-amber-700' };
    case 'REPORTED':
      return { labelKey: 'admin.zatca.status-reported', className: 'bg-blue-100 text-blue-700' };
    case 'CLEARED':
      return { labelKey: 'admin.zatca.status-cleared', className: 'bg-green-100 text-green-700' };
    case 'REJECTED':
      return { labelKey: 'admin.zatca.status-rejected', className: 'bg-red-100 text-red-700' };
    default:
      return {
        labelKey: status as unknown as TranslationKey,
        className: 'bg-surface-muted text-text-primary',
      };
  }
};

export default function AdminZatcaPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [statusTab, setStatusTab] = useState<string>('PENDING');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError, refetch } = api.zatca.listInvoices.useQuery(
    {
      page: 1,
      limit: 20,
    },
    { enabled: isAuthenticated },
  );
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
        <h1 className="text-2xl font-bold">{t('admin.zatca.title')}</h1>
        <Button
          variant="primary"
          onClick={() => {
            setBookingId('');
            setGenerateOpen(true);
          }}
        >
          {t('admin.zatca.issue-invoice')}
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
              {t(badge.labelKey)}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message={t('admin.zatca.load-error')} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('admin.zatca.empty-title', {
            status: t(statusBadge(statusTab).labelKey),
          })}
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
                      <p className="font-semibold">
                        {t('admin.zatca.invoice-number', {
                          number: String(inv.invoiceNumber ?? inv.id),
                        })}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {t(badge.labelKey)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-text-secondary">
                      <span>
                        {t('admin.zatca.booking', { code: inv.booking?.bookingCode ?? '—' })}
                      </span>
                      <span>{formatCurrency(Number(inv.booking?.totalAmount ?? 0))}</span>
                      <span>
                        {inv.createdAt
                          ? new Date(inv.createdAt).toLocaleDateString(
                              locale === 'en' ? 'en-GB' : 'ar-SA',
                            )
                          : '—'}
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
                      {t('admin.zatca.report')}
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
        title={t('admin.zatca.issue-title')}
      >
        <div className="space-y-4">
          <Input
            label={t('admin.zatca.booking-number')}
            type="number"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder={t('admin.zatca.booking-placeholder')}
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleGenerate} loading={generateMut.isPending}>
              {t('admin.zatca.issue-button')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setGenerateOpen(false);
                setBookingId('');
              }}
            >
              {t('button.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
