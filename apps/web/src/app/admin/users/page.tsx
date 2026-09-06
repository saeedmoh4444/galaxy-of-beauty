'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button, Input } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminUsersPage(): JSX.Element {
  const { t } = useLocale();
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = api.admin.listCustomers.useQuery({
    search: search || undefined,
    page: 1,
    limit: 20,
  });
  const suspendMut = api.admin.suspendUser.useMutation({ onSuccess: () => refetch() });
  const [, setSelected] = useState<Record<string, unknown> | null>(null);

  const customers =
    (data as unknown as { items: Record<string, unknown>[] } | undefined)?.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.users.title')}</h1>
      <Input
        placeholder={t('admin.users.search-placeholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message={t('admin.users.load-error')} onRetry={() => refetch()} />
      ) : customers.length === 0 ? (
        <EmptyState title={t('admin.users.empty')} />
      ) : (
        <div className="space-y-2">
          {customers.map((c: Record<string, unknown>) => (
            <Card key={c.id as number} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.name as string}</p>
                  <p className="text-sm text-text-secondary">{c.email as string}</p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {c.isActive ? t('status.active') : t('admin.users.suspended')}
                  </span>
                  <Button
                    size="sm"
                    variant={c.isActive ? 'danger' : 'primary'}
                    onClick={() => {
                      setSelected(c);
                      suspendMut.mutate({ userId: c.id as number });
                    }}
                  >
                    {c.isActive ? t('admin.users.suspend') : t('admin.users.activate')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
