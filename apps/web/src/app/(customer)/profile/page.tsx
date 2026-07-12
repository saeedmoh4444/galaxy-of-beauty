'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input, Modal } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  const [msg, setMsg] = useState('');

  // -- Profile tab --
  const { data: user, isLoading: userLoading, isError: userError, refetch: refetchUser } = api.auth.me.useQuery({} as never);
  const updateProfileMut = api.auth.updateProfile.useMutation({
    onSuccess: () => { setMsg('تم تحديث الملف الشخصي بنجاح'); refetchUser(); },
  });
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLang, setFormLang] = useState('ar');

  // -- Addresses tab --
  const { data: addresses, isLoading: addrLoading, isError: addrError, refetch: refetchAddr } = api.addresses.list.useQuery({} as never);
  const createAddrMut = api.addresses.create.useMutation({ onSuccess: () => { closeAddrModal(); refetchAddr(); } });
  const updateAddrMut = api.addresses.update.useMutation({ onSuccess: () => { closeAddrModal(); refetchAddr(); } });
  const deleteAddrMut = api.addresses.delete.useMutation({ onSuccess: () => refetchAddr() });
  const setDefaultAddrMut = api.addresses.setDefault.useMutation({ onSuccess: () => refetchAddr() });

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

  const addrList = (addresses as unknown as Record<string, unknown>[]) ?? [];

  const userData = user as unknown as Record<string, unknown>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">الملف الشخصي</h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-brand-600 text-brand-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            المعلومات الشخصية
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'addresses'
                ? 'border-b-2 border-brand-600 text-brand-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            العناوين
          </button>
        </div>

        {msg && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">{msg}</p>}

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <>
            {userLoading ? (
              <CardSkeleton />
            ) : userError ? (
              <ErrorAlert message="فشل تحميل الملف الشخصي" onRetry={() => refetchUser()} />
            ) : !userData ? (
              <div>
                <EmptyState title="لا توجد بيانات" />
                <div className="text-center"><Link href="/login"><Button>تسجيل الدخول</Button></Link></div>
              </div>
            ) : (
              <Card padding="lg">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateProfileMut.mutate({
                      name: formName || undefined,
                      phone: formPhone || undefined,
                      preferredLanguage: formLang as 'ar' | 'en' | undefined,
                    });
                  }}
                  className="space-y-4"
                >
                  <Input
                    label="الاسم"
                    defaultValue={userData.name as string}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                  <Input
                    label="رقم الجوال"
                    defaultValue={userData.phone as string}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">اللغة</label>
                    <select
                      defaultValue={userData.preferredLanguage as string}
                      onChange={(e) => setFormLang(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <Button type="submit" loading={updateProfileMut.isPending}>حفظ التغييرات</Button>
                </form>
              </Card>
            )}
          </>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <>
            <div className="flex justify-end">
              <Button onClick={() => setShowAddrModal(true)}>إضافة عنوان</Button>
            </div>

            {addrLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
            ) : addrError ? (
              <ErrorAlert message="فشل تحميل العناوين" onRetry={() => refetchAddr()} />
            ) : addrList.length === 0 ? (
              <div>
                <EmptyState title="لا توجد عناوين" description="أضف عنوانك الأول ليسهل عملية الحجز" />
                <div className="text-center">
                  <Button onClick={() => setShowAddrModal(true)}>إضافة عنوان</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {addrList.map((addr: Record<string, unknown>) => (
                  <Card key={addr.id as number} padding="md" className={addr.isDefault ? 'border-brand-500' : ''}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{addr.label as string}</p>
                          {Boolean(addr.isDefault) && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">افتراضي</span>}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{addr.city as string} - {addr.area as string}</p>
                        <p className="text-sm text-gray-500">{addr.street as string}{addr.building ? `, مبنى ${addr.building}` : ''}</p>
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
                          تعديل
                        </Button>
                        {!addr.isDefault && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setDefaultAddrMut.mutate({ id: addr.id as number })}>
                              تعيين افتراضي
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
                                  deleteAddrMut.mutate({ id: addr.id as number });
                                }
                              }}
                            >
                              حذف
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Modal open={showAddrModal} onClose={closeAddrModal} title={editingAddrId ? 'تعديل عنوان' : 'إضافة عنوان'} size="md">
              <div className="space-y-4">
                <Input label="تسمية (مثال: المنزل، العمل)" value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="المدينة" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
                  <Input label="المنطقة" value={addrForm.area} onChange={(e) => setAddrForm({ ...addrForm, area: e.target.value })} />
                </div>
                <Input label="الشارع" value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="المبنى" value={addrForm.building} onChange={(e) => setAddrForm({ ...addrForm, building: e.target.value })} />
                  <Input label="الطابق" value={addrForm.floor} onChange={(e) => setAddrForm({ ...addrForm, floor: e.target.value })} />
                  <Input label="الشقة" value={addrForm.apartment} onChange={(e) => setAddrForm({ ...addrForm, apartment: e.target.value })} />
                </div>
                <Button className="w-full" onClick={handleAddrSave} loading={createAddrMut.isPending || updateAddrMut.isPending}>
                  {editingAddrId ? 'تحديث العنوان' : 'إضافة العنوان'}
                </Button>
              </div>
            </Modal>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
