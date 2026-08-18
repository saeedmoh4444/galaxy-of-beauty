'use client';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, ErrorAlert, EmptyState, Button, Input, Modal } from '@galaxy/ui';
import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminPackagesPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading, isError, refetch } = api.beautyPackages.listAll.useQuery();
  const packages = data ?? [];
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', discountPercent: 15, serviceIds: '' });
  const createMut = api.beautyPackages.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreate(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.packages.title')}</h1>
        <Button onClick={() => setShowCreate(true)}>{t('admin.packages.add-package')}</Button>
      </div>
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : isError ? (
        <ErrorAlert message={t('admin.packages.load-error')} onRetry={() => refetch()} />
      ) : packages.length === 0 ? (
        <EmptyState title={t('admin.packages.empty')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <Card key={p.id} padding="md">
              <h3 className="font-bold">{(p.nameJson as Record<string, string>)?.ar}</h3>
              <p className="text-sm text-text-secondary">
                {t('admin.packages.meta', {
                  pct: p.discountPercent,
                  count: p.services?.length || 0,
                })}
              </p>
              <span
                className={`rounded px-2 py-0.5 text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {p.isActive ? t('status.active') : t('status.inactive')}
              </span>
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('admin.packages.add-title')}
      >
        <div className="space-y-3">
          <Input
            label={t('admin.packages.name-ar')}
            value={form.nameAr}
            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
          />
          <Input
            label={t('admin.packages.name-en')}
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          />
          <Input
            label={t('admin.packages.discount-percent')}
            type="number"
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
          />
          <Input
            label={t('admin.packages.service-ids')}
            value={form.serviceIds}
            onChange={(e) => setForm({ ...form, serviceIds: e.target.value })}
            placeholder="1,2,3"
          />
          <Button
            onClick={() =>
              createMut.mutate({
                ...form,
                serviceIds: form.serviceIds
                  .split(',')
                  .map(Number)
                  .filter((n) => n > 0),
              })
            }
            loading={createMut.isPending}
          >
            {t('button.save')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
