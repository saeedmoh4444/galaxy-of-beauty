'use client';

import { useState } from 'react';
import type { JSX } from 'react';
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
      return {
        labelKey: 'admin.zatca.status-pending',
        className: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
      };
    case 'REPORTED':
      return { labelKey: 'admin.zatca.status-reported', className: 'bg-blue-100 text-blue-700' };
    case 'CLEARED':
      return {
        labelKey: 'admin.zatca.status-cleared',
        className: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
      };
    case 'REJECTED':
      return {
        labelKey: 'admin.zatca.status-rejected',
        className: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
      };
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
  const [vatYear, setVatYear] = useState(new Date().getFullYear());
  const [vatPeriod, setVatPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const [vatIndex, setVatIndex] = useState(1);
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError, refetch } = api.zatca.listInvoices.useQuery(
    {
      page: 1,
      limit: 20,
    },
    { enabled: isAuthenticated },
  );
  // 6.1a — compliance dashboard + recent audit activity.
  const { data: dash } = api.zatca.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const generateMut = api.zatca.generateInvoice.useMutation({
    onSuccess: () => {
      refetch();
      setGenerateOpen(false);
      setBookingId('');
    },
  });
  const reportMut = api.zatca.reportInvoice.useMutation({ onSuccess: () => refetch() });
  // 6.1d — real-portal onboarding (Fatoorah).
  const [onboardOtp, setOnboardOtp] = useState('');
  const { data: onboard } = api.zatca.onboardingStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const onboardMut = api.zatca.requestComplianceCsid.useMutation({
    onSuccess: () => {
      setOnboardOtp('');
      void refetch();
    },
  });
  // 6.1c — clearance (REPORTED/PENDING) and re-report (REJECTED).
  const clearMut = api.zatca.clearInvoice.useMutation({ onSuccess: () => refetch() });
  // 6.1b — VAT report CSV export.
  const csvMut = api.zatca.vatReportCsv.useMutation({
    onSuccess: (res) => {
      const blob = new Blob([(res as unknown as { csv: string }).csv], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vat-${vatYear}-${vatPeriod}-${vatIndex}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const invoices = data?.items ?? [];

  const filtered = invoices.filter((inv) => inv.status === statusTab);

  const handleGenerate = () => {
    if (!bookingId) return;
    generateMut.mutate({ bookingId: Number(bookingId) });
  };

  const handleReport = (invoice: InvoiceItem) => {
    reportMut.mutate({ invoiceId: invoice.id });
  };
  const handleClear = (invoice: InvoiceItem) => {
    clearMut.mutate({ invoiceId: invoice.id });
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

      {/* 6.1b — VAT report export */}
      <Card padding="md">
        <h2 className="mb-3 font-semibold">{t('admin.zatca.export-title')}</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              {t('admin.zatca.export-year')}
            </label>
            <Input
              type="number"
              value={String(vatYear)}
              onChange={(e) => setVatYear(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              {t('admin.zatca.export-period')}
            </label>
            <select
              value={vatPeriod}
              onChange={(e) => {
                setVatPeriod(e.target.value as 'monthly' | 'quarterly');
                setVatIndex(1);
              }}
              className="rounded-lg border border-edge bg-surface-elevated p-2 text-sm"
            >
              <option value="monthly">{t('admin.zatca.export-monthly')}</option>
              <option value="quarterly">{t('admin.zatca.export-quarterly')}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              {t('admin.zatca.export-index')}
            </label>
            <Input
              type="number"
              value={String(vatIndex)}
              min={1}
              max={vatPeriod === 'monthly' ? 12 : 4}
              onChange={(e) => setVatIndex(Number(e.target.value))}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => csvMut.mutate({ year: vatYear, period: vatPeriod, index: vatIndex })}
            loading={csvMut.isPending}
          >
            {t('admin.zatca.export-button')}
          </Button>
        </div>
      </Card>
      {/* 6.1d — Fatoorah onboarding */}
      <Card padding="md">
        <h2 className="mb-1 font-semibold">{t('admin.zatca.onboarding-title')}</h2>
        <p className="mb-3 text-xs text-text-secondary">{t('admin.zatca.onboarding-subtitle')}</p>
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label={t('admin.zatca.otp')}
            value={onboardOtp}
            onChange={(e) => setOnboardOtp(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => onboardMut.mutate({ otp: onboardOtp })}
            loading={onboardMut.isPending}
          >
            {t('admin.zatca.onboard-button')}
          </Button>
          <p className="text-xs text-text-secondary">
            {t('admin.zatca.onboarding-status', {
              s: onboard?.credential
                ? t(
                    onboard.credential.status === 'ACTIVE'
                      ? 'admin.zatca.onboarding-active'
                      : onboard.credential.status === 'FAILED'
                        ? 'admin.zatca.onboarding-failed'
                        : 'admin.zatca.onboarding-pending',
                  )
                : t('admin.zatca.onboarding-pending'),
            })}
          </p>
        </div>
        {onboard?.credential?.errorMessage && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {onboard.credential.errorMessage}
          </p>
        )}
      </Card>

      {/* 6.1a — compliance dashboard */}
      <h2 className="text-lg font-bold">{t('admin.zatca.dashboard-title')}</h2>
      <div className="grid gap-4 sm:grid-cols-4">
        <Card padding="md" className="text-center">
          <p className="text-2xl font-bold">{dash?.totalInvoices ?? 0}</p>
          <p className="text-xs text-text-secondary">{t('admin.zatca.stat.invoices')}</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="text-2xl font-bold text-brand-600">
            {formatCurrency(dash?.totalVatCollected ?? 0)}
          </p>
          <p className="text-xs text-text-secondary">{t('admin.zatca.stat.vat')}</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {dash?.pendingReportCount ?? 0}
          </p>
          <p className="text-xs text-text-secondary">{t('admin.zatca.stat.pending')}</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {dash?.clearanceRate ?? 0}%
          </p>
          <p className="text-xs text-text-secondary">{t('admin.zatca.stat.clearance')}</p>
        </Card>
      </div>

      {/* 6.1a — recent audit activity */}
      <h2 className="text-lg font-bold">{t('admin.zatca.activity-title')}</h2>
      {(dash?.recentActivity ?? []).length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-4">
          {t('admin.zatca.activity-empty')}
        </p>
      ) : (
        <Card padding="md">
          <div className="space-y-2">
            {(dash?.recentActivity ?? []).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-mono text-xs text-text-secondary">{a.event}</span>
                <span className="flex-1 truncate">{a.invoiceNumber}</span>
                <span className="text-xs text-text-tertiary">
                  {a.createdAt
                    ? new Date(a.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA')
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const badge = statusBadge(tab);
          return (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${statusTab === tab ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary'}`}
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
                  {inv.status === 'REPORTED' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleClear(inv)}
                      loading={clearMut.isPending}
                    >
                      {t('admin.zatca.clear')}
                    </Button>
                  )}
                  {inv.status === 'REJECTED' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleReport(inv)}
                      loading={reportMut.isPending}
                    >
                      {t('admin.zatca.rereport')}
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
