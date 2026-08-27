'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminToolsPage(): JSX.Element {
  const { t } = useLocale();
  const { data: flags, isLoading } = api.featureFlags.list.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.admin-tools.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.admin-tools.subtitle')}</p>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('admin.admin-tools.feature-flags-title')}</h3>
          {isLoading ? (
            <CardListSkeleton count={4} />
          ) : !(flags ?? []).length ? (
            <p className="text-sm text-text-tertiary">{t('admin.admin-tools.no-flags')}</p>
          ) : (
            <div className="space-y-2">
              {(flags ?? []).map((f: Record<string, unknown>) => (
                <div
                  key={f.key as string}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-bold text-sm font-mono">{f.key as string}</p>
                    <p className="text-xs text-text-secondary">{(f.description as string) ?? ''}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${f.enabled ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-text-secondary'}`}
                  >
                    {f.enabled ? t('admin.enabled') : t('admin.disabled')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
