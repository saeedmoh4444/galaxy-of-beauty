'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, Input, Modal } from '@galaxy/ui';

type SettingsMap = RouterOutput['platform']['getSettings'];
type TermsData = RouterOutput['platform']['getTerms'];
type CityItem = RouterOutput['platform']['getCities'][number];

export default function AdminSettingsPage(): JSX.Element {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const { data, isLoading, isError, refetch } = api.platform.getSettings.useQuery();
  const settingsMap = data as SettingsMap | undefined;
  const settingsEntries = Object.entries(settingsMap ?? {});

  const updateMut = api.platform.updateSetting.useMutation({
    onSuccess: () => {
      refetch();
      setEditOpen(false);
      setSelectedKey(null);
    },
  });
  const toggleMaintenanceMut = api.platform.toggleMaintenance.useMutation({
    onSuccess: () => refetch(),
  });
  const termsQuery = api.platform.getTerms.useQuery();
  const citiesQuery = api.platform.getCities.useQuery();
  const exportBookingsQuery = api.platform.exportBookings.useQuery({ format: exportFormat });

  const termsData = termsQuery.data as TermsData | undefined;
  const citiesData = citiesQuery.data ?? [];
  const maintenanceMode = (settingsMap ?? {})['maintenance_mode'] === 'true';

  const openEdit = (key: string, value: string) => {
    setSelectedKey(key);
    setEditValue(value);
    setEditDescription('');
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedKey) return;
    updateMut.mutate({ key: selectedKey, value: editValue });
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
        ) : settingsEntries.length === 0 ? (
          <EmptyState title="لا توجد إعدادات" />
        ) : (
          <div className="space-y-2">
            {settingsEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{key}</p>
                  <p className="text-sm text-text-primary dark:text-gray-300">
                    {String(value ?? '')}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(key, value)}>
                  تعديل
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">وضع الصيانة</h2>
        <div className="flex items-center gap-4">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${maintenanceMode ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
          >
            {maintenanceMode ? 'نشط' : 'غير نشط'}
          </span>
          <Button
            variant={maintenanceMode ? 'primary' : 'danger'}
            onClick={() => toggleMaintenanceMut.mutate({})}
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
            <p>
              <strong>الإصدار الحالي:</strong> {String(termsData?.version ?? '—')}
            </p>
            <p>
              <strong>آخر تحديث:</strong>{' '}
              {termsData?.updatedAt
                ? new Date(termsData.updatedAt).toLocaleDateString('ar-SA')
                : '—'}
            </p>
            <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap rounded bg-surface-muted p-2 text-xs dark:bg-gray-900">
              {typeof termsData?.content === 'object' && termsData.content !== null
                ? String(
                    (termsData.content as { ar?: string }).ar ?? JSON.stringify(termsData.content),
                  )
                : String(termsData?.content ?? 'لا يوجد محتوى')}
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
            {citiesData.map((city: CityItem, i: number) => (
              <span
                key={i}
                className="rounded-full bg-surface-muted px-3 py-1 text-sm dark:bg-gray-800"
              >
                {city.nameAr}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Export */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">تصدير البيانات</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">
              الصيغة
            </label>
            <select
              className="rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
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
          <Button
            variant="outline"
            onClick={() => exportBookingsQuery.refetch()}
            loading={exportBookingsQuery.isFetching}
          >
            تصدير المستخدمين
          </Button>
        </div>
        {exportBookingsQuery.data && (
          <p className="mt-2 text-sm text-green-600">تم التصدير بنجاح</p>
        )}
      </Card>

      {/* Edit Setting Modal */}
      <Modal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedKey(null);
        }}
        title="تعديل الإعداد"
      >
        <div className="space-y-4">
          <p className="text-sm">
            <strong>المفتاح:</strong> {selectedKey}
          </p>
          <p className="text-sm text-text-secondary">{editDescription}</p>
          <Input label="القيمة" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleUpdate} loading={updateMut.isPending}>
              حفظ
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setEditOpen(false);
                setSelectedKey(null);
              }}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
