/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';

export default function AddressesPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.addresses.list.useQuery() as any;
  const addresses = (data ?? []) as Array<Record<string, any>>;

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
      addToast('success', 'تمت إضافة العنوان');
    },
  });
  const updateMut = api.addresses.update.useMutation({
    onSuccess: () => {
      refetch();
      closeForm();
      addToast('success', 'تم تحديث العنوان');
    },
  });
  const deleteMut = api.addresses.delete.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', 'تم حذف العنوان');
    },
  });
  const setDefaultMut = api.addresses.setDefault.useMutation({ onSuccess: () => refetch() });

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ label: '', city: '', area: '', street: '', building: '', floor: '', apartment: '' });
  };

  const openEdit = (addr: Record<string, any>) => {
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
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">العناوين</h1>
          <Button onClick={() => setShowForm(true)}>إضافة عنوان</Button>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل تحميل العناوين" onRetry={() => refetch()} />
        ) : addresses.length === 0 ? (
          <EmptyState title="لا توجد عناوين" description="أضف عنوانك الأول ليسهل عملية الحجز" />
        ) : (
          <div className="space-y-3">
            {addresses.map((addr: Record<string, any>) => (
              <Card key={addr.id} padding="md" className={addr.isDefault ? 'border-brand-500' : ''}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                          افتراضي
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
                        افتراضي
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEdit(addr)}>
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteMut.mutate({ id: addr.id })}
                    >
                      حذف
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
          title={editingId ? 'تعديل العنوان' : 'إضافة عنوان'}
        >
          <div className="space-y-3">
            <Input
              label="المسمى"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="مثال: المنزل"
            />
            <Input
              label="المدينة"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="المنطقة"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />
            <Input
              label="الشارع"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="المبنى"
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
              />
              <Input
                label="الطابق"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
              />
              <Input
                label="الشقة"
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
                حفظ
              </Button>
              <Button variant="secondary" onClick={closeForm}>
                إلغاء
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
