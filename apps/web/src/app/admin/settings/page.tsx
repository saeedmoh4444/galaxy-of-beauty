'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, Input, Modal } from '@galaxy/shared';

export default function AdminSettingsPage(): JSX.Element {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const { data, isLoading, isError, refetch } = api.platform.getSettings.useQuery({} as never);
  const settings = (data as unknown as Record<string, unknown>[]) ?? [];

  const updateMut = api.platform.updateSetting.useMutation({ onSuccess: () => { refetch(); setEditOpen(false); setSelectedKey(null); } });
  const toggleMaintenanceMut = api.platform.toggleMaintenance.useMutation({ onSuccess: () => refetch() });
  const termsQuery = api.platform.getTerms.useQuery({} as never);
  const citiesQuery = api.platform.getCities.useQuery({} as never);
  const exportBookingsQuery = api.platform.exportBookings.useQuery({ format: exportFormat } as never);

  const termsData = termsQuery.data as Record<string, unknown>;
  const citiesData = (citiesQuery.data as unknown as string[]) ?? [];
  const maintenanceMode = settings.find((s) => s.key === 'maintenance_mode')?.value === 'true';

  const openEdit = (setting: Record<string, unknown>) => {
    setSelectedKey(setting.key as string);
    setEditValue(setting.value as string);
    setEditDescription((setting.description as string) ?? '');
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedKey) return;
    updateMut.mutate({ key: selectedKey, value: editValue } as never);
  };

  const handleExport = () => {
    exportBookingsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الإعدادات</h1>
      </div>

      {/* Settings List */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">إعدادات المنصة</h2>
        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل تحميل الإعدادات" onRetry={() => refetch()} />
        ) : settings.length === 0 ? (
          <EmptyState title="لا توجد إعدادات" />
        ) : (
          <div className="space-y-2">
            {settings.map((s: Record<string, unknown>) => (
              <div
                key={s.key as string}
                className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.key as string}</p>
                  <p className="text-xs text-gray-500">{s.description as string ?? '—'}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{String(s.value ?? '')}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(s)}>تعديل</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">وضع الصيانة</h2>
        <div className="flex items-center gap-4">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${maintenanceMode ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {maintenanceMode ? 'نشط' : 'غير نشط'}
          </span>
          <Button
            variant={maintenanceMode ? 'primary' : 'danger'}
            onClick={() => toggleMaintenanceMut.mutate()}
            loading={toggleMaintenanceMut.isPending}
          >
            {maintenanceMode ? 'إيقاف الصيانة' : 'تفعيل الصيانة'}
          </Button>
        </div>
      </Card>

      {/* Terms Version */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">الشروط والأحكام</h2>
        {termsQuery.isLoading ? (
          <CardSkeleton />
        ) : termsQuery.isError ? (
          <ErrorAlert message="فشل تحميل الشروط" onRetry={() => termsQuery.refetch()} />
        ) : (
          <div className="space-y-1 text-sm">
            <p><strong>الإصدار الحالي:</strong> {String(termsData?.version ?? '—')}</p>
            <p><strong>آخر تحديث:</strong> {termsData?.updatedAt ? new Date(termsData.updatedAt as string).toLocaleDateString('ar-SA') : '—'}</p>
            <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs dark:bg-gray-900">
              {String(termsData?.content ?? 'لا يوجد محتوى')}
            </p>
          </div>
        )}
      </Card>

      {/* Cities */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">المدن المتاحة</h2>
        {citiesQuery.isLoading ? (
          <CardSkeleton />
        ) : citiesQuery.isError ? (
          <ErrorAlert message="فشل تحميل المدن" onRetry={() => citiesQuery.refetch()} />
        ) : citiesData.length === 0 ? (
          <EmptyState title="لا توجد مدن" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {citiesData.map((city: string, i: number) => (
              <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">{city}</span>
            ))}
          </div>
        )}
      </Card>

      {/* Export */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">تصدير البيانات</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">الصيغة</label>
            <select
              className="rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <Button variant="primary" onClick={handleExport} loading={exportBookingsQuery.isFetching}>
            تصدير الحجوزات
          </Button>
          <Button variant="outline" onClick={() => exportBookingsQuery.refetch()} loading={exportBookingsQuery.isFetching}>
            تصدير المستخدمين
          </Button>
        </div>
        {exportBookingsQuery.data && (
          <p className="mt-2 text-sm text-green-600">تم التصدير بنجاح</p>
        )}
      </Card>

      {/* Edit Setting Modal */}
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelectedKey(null); }} title="تعديل الإعداد">
        <div className="space-y-4">
          <p className="text-sm"><strong>المفتاح:</strong> {selectedKey}</p>
          <p className="text-sm text-gray-500">{editDescription}</p>
          <Input
            label="القيمة"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleUpdate} loading={updateMut.isPending}>حفظ</Button>
            <Button variant="secondary" onClick={() => { setEditOpen(false); setSelectedKey(null); }}>إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
