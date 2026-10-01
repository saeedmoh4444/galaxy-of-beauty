'use client';

import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, ErrorAlert } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type QueueName = 'wallet' | 'loyalty' | 'notifications' | 'integrations';

type QueueRow = {
  name: QueueName;
  unavailable: boolean;
  counts: { waiting: number; active: number; completed: number; failed: number; delayed: number };
  failedJobs: Array<{
    id: string;
    name: string;
    failedReason: string | null;
    attemptsMade: number;
    failedOn: string | null;
  }>;
};

const COUNT_KEYS = {
  waiting: 'admin.queues.waiting',
  active: 'admin.queues.active',
  completed: 'admin.queues.completed',
  failed: 'admin.queues.failed',
  delayed: 'admin.queues.delayed',
} as const;

export default function AdminQueuesPage(): JSX.Element {
  const { t } = useLocale();
  const listQ = api.queues.list.useQuery();
  const retryMut = api.queues.retryFailed.useMutation();
  const removeMut = api.queues.removeFailed.useMutation();

  if (listQ.isLoading) return <CardListSkeleton count={4} />;
  if (listQ.isError) {
    return <ErrorAlert message={t('common.loadFailed')} onRetry={() => listQ.refetch()} />;
  }

  const rows = (listQ.data as QueueRow[] | undefined) ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.queues.title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('admin.queues.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <Card key={row.name} padding="lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{row.name}</h2>
              {row.unavailable ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  {t('admin.queues.unavailable')}
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(COUNT_KEYS) as Array<keyof typeof COUNT_KEYS>).map((label) => (
                <span
                  key={label}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    label === 'failed' && row.counts.failed > 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-surface-muted text-text-secondary'
                  }`}
                >
                  {t(COUNT_KEYS[label])}: {row.counts[label]}
                </span>
              ))}
            </div>

            {row.counts.failed > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-bold text-text-secondary">
                  {t('admin.queues.failedJobs')}
                </p>
                {row.failedJobs.length === 0 ? (
                  <p className="text-sm text-text-secondary">{t('admin.queues.noFailed')}</p>
                ) : (
                  row.failedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{job.name}</p>
                        <p className="truncate text-xs text-text-secondary">
                          {job.failedReason ?? '—'} · {t('admin.queues.attempts')}:{' '}
                          {job.attemptsMade}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            retryMut.mutate(
                              { queue: row.name, jobId: job.id },
                              { onSuccess: () => listQ.refetch() },
                            )
                          }
                        >
                          {t('admin.queues.retry')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            removeMut.mutate(
                              { queue: row.name, jobId: job.id },
                              { onSuccess: () => listQ.refetch() },
                            )
                          }
                        >
                          {t('admin.queues.remove')}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
