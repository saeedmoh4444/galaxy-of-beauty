'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  GridSkeleton,
  CardListSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Modal,
  formatCurrency,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const COMPENSATION_TYPES: {
  key: 'redo' | 'refund' | 'credit';
  emoji: string;
  label: TranslationKey;
  desc: TranslationKey;
}[] = [
  {
    key: 'redo',
    emoji: '',
    label: 'warranty.comp.redo',
    desc: 'warranty.comp.redoDesc',
  },
  {
    key: 'refund',
    emoji: '',
    label: 'warranty.comp.refund',
    desc: 'warranty.comp.refundDesc',
  },
  {
    key: 'credit',
    emoji: '',
    label: 'warranty.comp.credit',
    desc: 'warranty.comp.creditDesc',
  },
];

export default function ServiceWarrantyPage(): JSX.Element {
  const { t } = useLocale();
  const { data: policy, isLoading: pLoad } = api.serviceWarranty.policy.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
  };
  const {
    data: claims,
    isLoading: cLoad,
    isError,
    refetch,
  } = api.serviceWarranty.myClaims.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const [eligibilityBookingId, setEligibilityBookingId] = useState(0);
  const { data: eligibility } = api.serviceWarranty.checkEligibility.useQuery(
    { bookingId: eligibilityBookingId },
    { enabled: eligibilityBookingId > 0 },
  ) as { data: Record<string, unknown> | undefined; refetch: () => void };
  const claimMut = api.serviceWarranty.claim.useMutation({
    onSuccess: () => {
      setShowClaim(false);
      refetch();
    },
  });

  const [bookingId, setBookingId] = useState('');
  const [showClaim, setShowClaim] = useState(false);
  const [reason, setReason] = useState('');
  const [compType, setCompType] = useState<'redo' | 'refund' | 'credit'>('redo');
  const [claimError, setClaimError] = useState('');

  const handleCheck = () => {
    if (!bookingId) return;
    setEligibilityBookingId(parseInt(bookingId, 10));
  };

  const handleClaim = () => {
    setClaimError('');
    if (reason.trim().length < 10) {
      setClaimError(t('warranty.err.reason'));
      return;
    }
    claimMut.mutate({
      bookingId: parseInt(bookingId, 10),
      reason: reason.trim(),
      compensationType: compType,
    });
  };

  const coverage = (policy?.coverage as Array<Record<string, string>>) ?? [];
  const myClaims = claims ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('warranty.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('warranty.subtitle')}</p>
        </div>

        {/* Coverage */}
        <Card padding="lg">
          <h3 className="font-bold text-lg mb-4">{t('warranty.coverageTitle')}</h3>
          {pLoad ? (
            <GridSkeleton count={3} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {coverage.map((c: Record<string, string>, i: number) => (
                <div
                  key={i}
                  className="text-center rounded-xl bg-surface-muted dark:bg-gray-800 p-4"
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <h4 className="mt-2 font-bold text-sm">{c.titleAr}</h4>
                  <p className="mt-1 text-xs text-text-secondary">{c.descAr}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Eligibility Check */}
        <Card padding="lg">
          <h3 className="font-bold text-lg mb-4">{t('warranty.eligibilityTitle')}</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder={t('warranty.bookingId')}
              className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button onClick={handleCheck}>{t('warranty.check')}</Button>
          </div>
          {eligibility && (
            <div
              className={`mt-3 rounded-lg p-3 text-sm ${(eligibility.eligible as boolean) ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'}`}
            >
              {(eligibility.eligible as boolean)
                ? t('warranty.eligible')
                : ` ${eligibility.reason as string}`}
              {(eligibility.eligible as boolean) && (
                <div className="mt-2">
                  <Button size="sm" onClick={() => setShowClaim(true)}>
                    {t('warranty.submitClaim')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* My Claims */}
        <h3 className="text-lg font-bold">{t('warranty.myClaims')}</h3>
        {cLoad ? (
          <CardListSkeleton count={3} />
        ) : isError ? (
          <ErrorAlert message={t('warranty.err.load')} onRetry={() => refetch()} />
        ) : myClaims.length === 0 ? (
          <EmptyState title={t('warranty.empty.title')} description={t('warranty.empty.desc')} />
        ) : (
          <div className="space-y-3">
            {myClaims.map((c: Record<string, unknown>) => (
              <Card key={c.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">
                      {t('warranty.claimId', { id: c.bookingId as number })}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">{c.reason as string}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : c.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : c.status === 'COMPENSATED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {c.status === 'PENDING'
                        ? t('warranty.status.pending')
                        : c.status === 'APPROVED'
                          ? t('warranty.status.approved')
                          : c.status === 'REJECTED'
                            ? t('warranty.status.rejected')
                            : t('warranty.status.compensated')}
                    </span>
                    {(c.compensation as number) > 0 && (
                      <p className="text-xs font-bold text-brand-600 mt-0.5">
                        {formatCurrency(c.compensation as number)} {t('misc.sar')}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={showClaim}
          onClose={() => setShowClaim(false)}
          title={t('warranty.modal.title')}
        >
          <div className="space-y-4">
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- label precedes a non-labelable button group */}
              <label className="block text-sm font-semibold mb-2">{t('warranty.compType')}</label>
              <div className="space-y-2">
                {COMPENSATION_TYPES.map((comp) => (
                  <button
                    key={comp.key}
                    type="button"
                    onClick={() => setCompType(comp.key)}
                    className={`w-full text-right rounded-xl border p-3 text-sm transition-all ${compType === comp.key ? 'border-brand-400 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <span className="font-bold">
                      {comp.emoji} {t(comp.label)}
                    </span>
                    <p className="text-xs text-text-secondary mt-0.5">{t(comp.desc)}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="sw-reason" className="block text-sm font-semibold mb-1">
                {t('warranty.reason')}
              </label>
              <textarea
                id="sw-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={t('warranty.reasonPlaceholder')}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            {claimError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {claimError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowClaim(false)}>
                {t('warranty.cancel')}
              </Button>
              <Button onClick={handleClaim} loading={claimMut.isPending}>
                {t('warranty.submit')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
