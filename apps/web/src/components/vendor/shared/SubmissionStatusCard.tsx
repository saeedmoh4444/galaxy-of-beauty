'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Input } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

/**
 * G2 — submission status & resubmission (Wave 6). Replaces the static
 * "pending review" banner on every venue dashboard: the caller's latest
 * provider submission drives a timeline card — under review (with SLA
 * hint), rejected (with the admin note + a resubmit form), approved.
 */
export function SubmissionStatusCard(): JSX.Element {
  const { t } = useLocale();
  const subsQ = api.vendorPortal.mySubmissions.useQuery({});
  const resubmitMut = api.vendorPortal.resubmitSubmission.useMutation({
    onSuccess: () => {
      void subsQ.refetch();
      setName('');
      setBio('');
    },
  });
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const subs = subsQ.data ?? [];
  const latest = subs[0];
  if (subsQ.isLoading || !latest) return <></>;
  if (latest.status === 'APPROVED') return <></>;

  return (
    <Card
      padding="md"
      className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
    >
      {latest.status === 'PENDING_REVIEW' ? (
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            {t('vendorPortal.submission.under-review')}
          </p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            {t('vendorPortal.submission.sla')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            {t('vendorPortal.submission.rejected')}
          </p>
          {latest.reviewNotes ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {t('vendorPortal.submission.note', { note: latest.reviewNotes })}
            </p>
          ) : null}
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label={t('vendorPortal.submission.resubmit-name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-44"
            />
            <Input
              label={t('vendorPortal.submission.resubmit-bio')}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-56"
            />
            <Button
              size="sm"
              disabled={!name.trim()}
              onClick={() =>
                resubmitMut.mutate({
                  submissionId: latest.id,
                  name: name.trim(),
                  ...(bio.trim() ? { bio: bio.trim() } : {}),
                })
              }
              loading={resubmitMut.isPending}
            >
              {t('vendorPortal.submission.resubmit')}
            </Button>
          </div>
          {resubmitMut.isSuccess && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {t('vendorPortal.submission.resubmitted')}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
