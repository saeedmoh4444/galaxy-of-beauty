'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button, Input, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type AddressItem = RouterOutputs['addresses']['list'][number];

export default function AddressesPage(): JSX.Element {
  const { t } = useLocale();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = api.addresses.list.useQuery();
  const addresses = data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    label: '',
    city: '',
    area: '',
    street: '',
    building: '',
    floor: '',
    apartment: '',
  });

  const createMut = api.addresses.create.useMutation({
    onSuccess: () => {
      refetch();
      closeForm();
      addToast('success', t('profile.address-added'));
    },
  });
  const updateMut = api.addresses.update.useMutation({
    onSuccess: () => {
      refetch();
      closeForm();
      addToast('success', t('profile.address-updated'));
    },
  });
  const deleteMut = api.addresses.delete.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', t('profile.address-deleted'));
    },
  });
  const setDefaultMut = api.addresses.setDefault.useMutation({ onSuccess: () => refetch() });

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ label: '', city: '', area: '', street: '', building: '', floor: '', apartment: '' });
  };

  const openEdit = (addr: AddressItem) => {
    setForm({
      label: addr.label || '',
      city: addr.city || '',
      area: addr.area || '',
      street: addr.street || '',
      building: addr.building || '',
      floor: addr.floor || '',
      apartment: addr.apartment || '',
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingId) updateMut.mutate({ id: editingId, ...form });
    else createMut.mutate(form);
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
            {t('profile.addresses')}
          </h1>
          <Button onClick={() => setShowForm(true)}>{t('profile.add-address')}</Button>
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : isError ? (
          <ErrorAlert message={t('profile.addresses-load-error')} onRetry={() => refetch()} />
        ) : addresses.length === 0 ? (
          <EmptyState
            title={t('profile.no-addresses')}
            description={t('profile.add-first-address')}
          />
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <Card key={addr.id} padding="md" className={addr.isDefault ? 'border-brand-500' : ''}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                          {t('profile.default')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">
                      {addr.street}، {addr.area}، {addr.city}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!addr.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDefaultMut.mutate({ id: addr.id })}
                      >
                        {t('profile.default')}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEdit(addr)}>
                      {t('button.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteMut.mutate({ id: addr.id })}
                    >
                      {t('button.delete')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={showForm}
          onClose={closeForm}
          title={editingId ? t('profile.edit-address') : t('profile.add-address')}
        >
          <div className="space-y-3">
            <Input
              label={t('profile.address-label')}
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder={t('profile.label-placeholder')}
            />
            <Input
              label={t('profile.city')}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label={t('profile.area')}
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />
            <Input
              label={t('profile.street')}
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                label={t('profile.building')}
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
              />
              <Input
                label={t('profile.floor')}
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
              />
              <Input
                label={t('profile.apartment')}
                value={form.apartment}
                onChange={(e) => setForm({ ...form, apartment: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                loading={createMut.isPending || updateMut.isPending}
                className="flex-1"
              >
                {t('button.save')}
              </Button>
              <Button variant="secondary" onClick={closeForm}>
                {t('button.cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
