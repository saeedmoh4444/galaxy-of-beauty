'use client';

import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { Card, TableSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { useToast } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type FlagItem = RouterOutputs['featureFlags']['list'][number];

export default function FeatureFlagsPage(): JSX.Element {
  const { t } = useLocale();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = api.featureFlags.list.useQuery();
  const flags: FlagItem[] = data ?? [];
  const toggleMut = api.featureFlags.toggle.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', t('admin.feature-flags.updated-toast'));
    },
    onError: () => addToast('error', t('admin.feature-flags.update-failed-toast')),
  });

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">Feature Flags</h1>
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : isError ? (
          <ErrorAlert message={t('admin.feature-flags.load-error')} onRetry={() => refetch()} />
        ) : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-text-secondary dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="p-3 text-right">{t('admin.feature-flags.feature-header')}</th>
                  <th className="p-3 text-right">{t('admin.feature-flags.status-header')}</th>
                  <th className="p-3 text-right">{t('admin.feature-flags.rollout-header')}</th>
                  <th className="p-3 text-right">{t('admin.feature-flags.action-header')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {flags.map((f: FlagItem) => (
                  <tr key={f.key}>
                    <td className="p-3 font-medium">
                      {f.name}
                      <br />
                      <span className="text-xs text-text-tertiary">{f.key}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${f.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {f.enabled ? t('admin.enabled') : t('admin.disabled')}
                      </span>
                    </td>
                    <td className="p-3 text-text-secondary">{f.rolloutPercent}%</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleMut.mutate({ key: f.key })}
                      >
                        {f.enabled
                          ? t('admin.feature-flags.disable')
                          : t('admin.feature-flags.enable')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </>
  );
}
