'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { Button, Card, GridSkeleton, ErrorAlert, EmptyState, Modal } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { type TranslationKey } from '@galaxy/shared';

const KYC_TABS = ['ALL', 'PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'] as const;

type TechnicianItem = RouterOutputs['admin']['listTechnicians']['items'][number];

const kycBadge = (status: string): { labelKey: TranslationKey; className: string } => {
  switch (status) {
    case 'VERIFIED':
      return {
        labelKey: 'admin.technicians.kyc-verified',
        className: 'bg-green-100 text-green-700',
      };
    case 'SUBMITTED':
      return {
        labelKey: 'admin.technicians.kyc-submitted',
        className: 'bg-blue-100 text-blue-700',
      };
    case 'REJECTED':
      return { labelKey: 'admin.technicians.kyc-rejected', className: 'bg-red-100 text-red-700' };
    case 'PENDING':
    default:
      return {
        labelKey: 'admin.technicians.kyc-pending',
        className: 'bg-amber-100 text-amber-700',
      };
  }
};

export default function AdminTechniciansPage(): JSX.Element {
  const { t } = useLocale();
  const [kycTab, setKycTab] = useState<string>('ALL');
  const [reviewTech, setReviewTech] = useState<TechnicianItem | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Structural cast instead of RouterOutput — avoids TS2589 from deeply
  // nested admin RouterOutput in Next.js build
  const { data, isLoading, isError, refetch } = (
    api as unknown as {
      admin: {
        listTechnicians: {
          useQuery: (input: { page: number; limit: number }) => {
            data: { items: TechnicianItem[] } | undefined;
            isLoading: boolean;
            isError: boolean;
            refetch: () => void;
          };
        };
      };
    }
  ).admin.listTechnicians.useQuery({
    page: 1,
    limit: 50,
  });
  const verifyMut = api.technicians.verifyKyc.useMutation({
    onSuccess: () => {
      refetch();
      setReviewTech(null);
      setReviewNote('');
    },
  });
  const suspendMut = api.admin.suspendUser.useMutation({ onSuccess: () => refetch() });

  const technicians: TechnicianItem[] = data?.items ?? [];

  const filtered =
    kycTab === 'ALL' ? technicians : technicians.filter((t) => t.kycStatus === kycTab);

  const handleVerify = (approved: boolean) => {
    if (!reviewTech) return;
    verifyMut.mutate({
      userId: reviewTech.userId,
      status: approved ? ('VERIFIED' as const) : ('REJECTED' as const),
      notes: reviewNote || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.technicians.title')}</h1>

      <div className="flex flex-wrap gap-2">
        {KYC_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setKycTab(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${kycTab === tab ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800 dark:text-gray-300'}`}
          >
            {tab === 'ALL'
              ? t('admin.all')
              : tab === 'PENDING'
                ? t('admin.technicians.kyc-pending')
                : tab === 'SUBMITTED'
                  ? t('admin.technicians.kyc-submitted')
                  : tab === 'VERIFIED'
                    ? t('admin.technicians.kyc-verified')
                    : t('admin.technicians.kyc-rejected')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : isError ? (
        <ErrorAlert message={t('admin.technicians.load-error')} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('admin.technicians.empty')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((tech: TechnicianItem) => {
            const badge = kycBadge(tech.kycStatus);
            return (
              <Card key={tech.id} padding="md">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{tech.user.name}</p>
                      <p className="text-sm text-text-secondary">{tech.user.email}</p>
                      <p className="text-sm text-text-secondary">{tech.city ?? '—'}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {t(badge.labelKey)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span> {Number(tech.ratingAvg ?? 0).toFixed(1)}</span>
                    <span>
                      {t('admin.technicians.bookings-count', {
                        count: Number(tech.completedBookings ?? 0),
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tech.kycStatus !== 'VERIFIED' && (
                      <Button size="sm" variant="primary" onClick={() => setReviewTech(tech)}>
                        {t('admin.technicians.review-kyc')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={tech.user.isActive ? 'danger' : 'primary'}
                      onClick={() => suspendMut.mutate({ userId: tech.userId })}
                    >
                      {tech.user.isActive
                        ? t('admin.technicians.suspend')
                        : t('admin.technicians.unsuspend')}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* KYC Review Modal */}
      <Modal
        open={!!reviewTech}
        onClose={() => {
          setReviewTech(null);
          setReviewNote('');
        }}
        title={t('admin.technicians.review-title')}
      >
        {reviewTech && (
          <div className="space-y-4">
            <p className="text-sm">
              <strong>{t('admin.technicians.name-label')}</strong> {reviewTech.user.name}
            </p>
            <p className="text-sm">
              <strong>{t('admin.technicians.email-label')}</strong> {reviewTech.user.email}
            </p>
            <p className="text-sm">
              <strong>{t('admin.technicians.kyc-status-label')}</strong> {reviewTech.kycStatus}
            </p>

            <div>
              <p className="mb-1 text-sm font-medium">{t('admin.technicians.documents-label')}</p>
              {((reviewTech.kycDocuments as { type: string; url: string }[]) ?? []).length > 0 ? (
                (reviewTech.kycDocuments as { type: string; url: string }[]).map(
                  (doc, i: number) => (
                    <p key={i} className="text-sm text-blue-600 hover:underline cursor-pointer">
                      {doc.type ?? t('admin.technicians.document-index', { index: i + 1 })}
                    </p>
                  ),
                )
              ) : (
                <p className="text-sm text-text-secondary">{t('admin.technicians.no-documents')}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="at-review-note"
                className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300"
              >
                {t('admin.technicians.notes')}
              </label>
              <textarea
                id="at-review-note"
                className="w-full rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={t('admin.technicians.notes-placeholder')}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => handleVerify(true)}
                loading={verifyMut.isPending}
              >
                {t('admin.technicians.approve-kyc')}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleVerify(false)}
                loading={verifyMut.isPending}
              >
                {t('admin.technicians.reject-kyc')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setReviewTech(null);
                  setReviewNote('');
                }}
              >
                {t('button.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
