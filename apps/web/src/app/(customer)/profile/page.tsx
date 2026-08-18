'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import {
  Card,
  FormSkeleton,
  CardListSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Input,
  Modal,
  InlineEdit,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { useRouter } from 'next/navigation';

type ProfileUser = NonNullable<RouterOutput['auth']['me']>;
type ProfileAddress = RouterOutput['addresses']['list'][number];

type AddressForm = {
  label: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
};

const emptyAddressForm: AddressForm = {
  label: '',
  city: '',
  area: '',
  street: '',
  building: '',
  floor: '',
  apartment: '',
};

export default function ProfilePage(): JSX.Element {
  const { t, setLocale } = useLocale();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  const [msg, setMsg] = useState('');

  // -- Profile tab --
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
    refetch: refetchUser,
  } = api.auth.me.useQuery();
  const updateProfileMut = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      setMsg(t('profile.updated-success'));
      refetchUser();
    },
  });

  // Inline edits save a single field at a time (UI/UX backlog 3.2)
  const saveName = async (name: string): Promise<string> => {
    await updateProfileMut.mutateAsync({ name });
    return name;
  };
  const savePhone = async (phone: string): Promise<string> => {
    await updateProfileMut.mutateAsync({ phone });
    return phone;
  };
  const router = useRouter();
  const saveLanguage = (lang: 'ar' | 'en') => {
    updateProfileMut.mutate({ preferredLanguage: lang }); // cross-device persistence
    setLocale(lang); // cookie + context + html attrs (immediate flip)
    router.refresh();
  };

  // -- Addresses tab --
  const {
    data: addresses,
    isLoading: addrLoading,
    isError: addrError,
    refetch: refetchAddr,
  } = api.addresses.list.useQuery();
  const createAddrMut = api.addresses.create.useMutation({
    onSuccess: () => {
      closeAddrModal();
      refetchAddr();
    },
  });
  const updateAddrMut = api.addresses.update.useMutation({
    onSuccess: () => {
      closeAddrModal();
      refetchAddr();
    },
  });
  const deleteAddrMut = api.addresses.delete.useMutation({ onSuccess: () => refetchAddr() });
  const setDefaultAddrMut = api.addresses.setDefault.useMutation({
    onSuccess: () => refetchAddr(),
  });

  const [showAddrModal, setShowAddrModal] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<number | null>(null);
  const [addrForm, setAddrForm] = useState<AddressForm>(emptyAddressForm);

  const closeAddrModal = () => {
    setShowAddrModal(false);
    setEditingAddrId(null);
    setAddrForm(emptyAddressForm);
  };

  const handleAddrSave = () => {
    if (editingAddrId) {
      updateAddrMut.mutate({ id: editingAddrId, ...addrForm });
    } else {
      createAddrMut.mutate(addrForm);
    }
  };

  const addrList: ProfileAddress[] = addresses ?? [];

  const userData: ProfileUser | undefined = user ?? undefined;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-brand-600 text-brand-600'
                : 'text-text-secondary hover:text-text-primary dark:text-gray-400'
            }`}
          >
            {t('profile.personal-info')}
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'addresses'
                ? 'border-b-2 border-brand-600 text-brand-600'
                : 'text-text-secondary hover:text-text-primary dark:text-gray-400'
            }`}
          >
            {t('profile.addresses')}
          </button>
        </div>

        {msg && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
            {msg}
          </p>
        )}

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <>
            {userLoading ? (
              <FormSkeleton fields={3} />
            ) : userError ? (
              <ErrorAlert message={t('profile.load-error')} onRetry={() => refetchUser()} />
            ) : !userData ? (
              <div>
                <EmptyState title={t('state.empty')} />
                <div className="text-center">
                  <Link href="/login">
                    <Button>{t('profile.login')}</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Card padding="lg">
                <div className="space-y-4">
                  <div>
                    <span className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">
                      {t('profile.name')}
                    </span>
                    <InlineEdit
                      label={t('profile.name')}
                      value={(userData.name as string) ?? ''}
                      onSave={saveName}
                      validate={(v) => (v.length < 2 ? t('profile.name-too-short') : null)}
                      disabled={updateProfileMut.isPending}
                    />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">
                      {t('profile.phone')}
                    </span>
                    <InlineEdit
                      label={t('profile.phone')}
                      value={(userData.phone as string) ?? ''}
                      onSave={savePhone}
                      validate={(v) => (/^\+9665\d{8}$/.test(v) ? null : t('profile.phone-format'))}
                      placeholder="+9665xxxxxxxx"
                      disabled={updateProfileMut.isPending}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pf-lang"
                      className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300"
                    >
                      {t('profile.language')}
                    </label>
                    <select
                      id="pf-lang"
                      value={(userData.preferredLanguage as string) ?? 'ar'}
                      onChange={(e) => saveLanguage(e.target.value as 'ar' | 'en')}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                      <option value="ar">{t('profile.arabic')}</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <>
            <div className="flex justify-end">
              <Button onClick={() => setShowAddrModal(true)}>{t('profile.add-address')}</Button>
            </div>

            {addrLoading ? (
              <CardListSkeleton count={3} />
            ) : addrError ? (
              <ErrorAlert
                message={t('profile.addresses-load-error')}
                onRetry={() => refetchAddr()}
              />
            ) : addrList.length === 0 ? (
              <div>
                <EmptyState
                  title={t('profile.no-addresses')}
                  description={t('profile.add-first-address')}
                />
                <div className="text-center">
                  <Button onClick={() => setShowAddrModal(true)}>{t('profile.add-address')}</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {addrList.map((addr: Record<string, unknown>) => (
                  <Card
                    key={addr.id as number}
                    padding="md"
                    className={addr.isDefault ? 'border-brand-500' : ''}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{addr.label as string}</p>
                          {Boolean(addr.isDefault) && (
                            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                              {t('profile.default')}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">
                          {addr.city as string} - {addr.area as string}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {addr.street as string}
                          {addr.building
                            ? t('profile.building-suffix', { building: addr.building as string })
                            : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAddrForm({
                              label: addr.label as string,
                              city: addr.city as string,
                              area: addr.area as string,
                              street: addr.street as string,
                              building: (addr.building as string) ?? '',
                              floor: (addr.floor as string) ?? '',
                              apartment: (addr.apartment as string) ?? '',
                            });
                            setEditingAddrId(addr.id as number);
                            setShowAddrModal(true);
                          }}
                        >
                          {t('button.edit')}
                        </Button>
                        {!addr.isDefault && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDefaultAddrMut.mutate({ id: addr.id as number })}
                            >
                              {t('profile.set-default')}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (confirm(t('profile.delete-address-confirm'))) {
                                  deleteAddrMut.mutate({ id: addr.id as number });
                                }
                              }}
                            >
                              {t('button.delete')}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Modal
              open={showAddrModal}
              onClose={closeAddrModal}
              title={editingAddrId ? t('profile.edit-address') : t('profile.add-address')}
              size="md"
            >
              <div className="space-y-4">
                <Input
                  label={t('profile.label-hint')}
                  value={addrForm.label}
                  onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t('profile.city')}
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  />
                  <Input
                    label={t('profile.area')}
                    value={addrForm.area}
                    onChange={(e) => setAddrForm({ ...addrForm, area: e.target.value })}
                  />
                </div>
                <Input
                  label={t('profile.street')}
                  value={addrForm.street}
                  onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label={t('profile.building')}
                    value={addrForm.building}
                    onChange={(e) => setAddrForm({ ...addrForm, building: e.target.value })}
                  />
                  <Input
                    label={t('profile.floor')}
                    value={addrForm.floor}
                    onChange={(e) => setAddrForm({ ...addrForm, floor: e.target.value })}
                  />
                  <Input
                    label={t('profile.apartment')}
                    value={addrForm.apartment}
                    onChange={(e) => setAddrForm({ ...addrForm, apartment: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddrSave}
                  loading={createAddrMut.isPending || updateAddrMut.isPending}
                >
                  {editingAddrId ? t('profile.update-address') : t('profile.add-address-submit')}
                </Button>
              </div>
            </Modal>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
