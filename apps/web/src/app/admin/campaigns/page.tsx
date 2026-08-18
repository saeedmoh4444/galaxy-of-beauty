'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button, Input, Modal } from '@galaxy/ui';
import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function AdminCampaignsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading, isError, refetch } = api.campaigns.listAll.useQuery();
  const campaigns = data ?? [];
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    nameAr: '',
    nameEn: '',
    discountType: 'percent',
    discountValue: 20,
    promoCode: '',
    startsAt: '',
    endsAt: '',
  });
  const createMut = api.campaigns.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreate(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.campaigns.title')}</h1>
        <Button onClick={() => setShowCreate(true)}>{t('admin.campaigns.add-campaign')}</Button>
      </div>
      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message={t('admin.campaigns.load-error')} onRetry={() => refetch()} />
      ) : campaigns.length === 0 ? (
        <EmptyState title={t('admin.campaigns.empty')} />
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <Card key={c.id} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{localize(c.nameJson, locale)}</h3>
                  <p className="text-sm text-text-secondary">
                    {c.discountType === 'percent'
                      ? `-${c.discountValue as unknown as number}%`
                      : `-${c.discountValue as unknown as number} ${t('misc.sar')}`}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-text-secondary'}`}
                >
                  {c.isActive ? t('status.active') : t('status.inactive')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('admin.campaigns.add-title')}
      >
        <div className="space-y-3">
          <Input
            label={t('admin.campaigns.name-ar')}
            value={form.nameAr}
            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
          />
          <Input
            label={t('admin.campaigns.name-en')}
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          />
          <Input
            label={t('admin.campaigns.discount-value')}
            type="number"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
          />
          <Input
            label={t('admin.campaigns.promo-code')}
            value={form.promoCode}
            onChange={(e) => setForm({ ...form, promoCode: e.target.value })}
          />
          <Input
            label={t('admin.campaigns.starts-at')}
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
          />
          <Input
            label={t('admin.campaigns.ends-at')}
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
          />
          <Button
            onClick={() =>
              createMut.mutate({
                nameAr: form.nameAr,
                nameEn: form.nameEn,
                discountType: form.discountType as 'percent' | 'fixed',
                discountValue: Number(form.discountValue),
                promoCode: form.promoCode || undefined,
                startsAt: new Date(form.startsAt).toISOString(),
                endsAt: new Date(form.endsAt).toISOString(),
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
