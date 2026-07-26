'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

type AreaItem = RouterOutput['platform']['listAreas'][number];
type CityItem = RouterOutput['platform']['getCities'][number];

export default function AdminAreasPage(): JSX.Element {
  const { addToast } = useToast();
  const [cityFilter, setCityFilter] = useState<number | undefined>();
  const [showAdd, setShowAdd] = useState(false);
  const [newArea, setNewArea] = useState({ cityId: '', nameAr: '', nameEn: '' });

  const { data: areasData, isLoading, isError, refetch } = api.platform.listAreas.useQuery(
    cityFilter ? { cityId: cityFilter } : {},
  );
  const { data: citiesData } = api.platform.getCities.useQuery();
  const areas: AreaItem[] = areasData ?? [];
  const cities: CityItem[] = citiesData ?? [];

  const createMut = api.platform.createArea.useMutation({
    onSuccess: () => { setShowAdd(false); refetch(); addToast('success', 'تمت إضافة المنطقة'); },
    onError: () => addToast('error', 'فشلت الإضافة'),
  });
  const deleteMut = api.platform.deleteArea.useMutation({
    onSuccess: () => { refetch(); addToast('success', 'تم تعطيل المنطقة'); },
  });

  const handleAdd = () => {
    if (!newArea.cityId || !newArea.nameAr) { addToast('warning', 'الرجاء إدخال البيانات'); return; }
    createMut.mutate({ cityId: Number(newArea.cityId), nameAr: newArea.nameAr, nameEn: newArea.nameEn || newArea.nameAr });
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">إدارة المناطق</h1>
          <Button onClick={() => setShowAdd(true)}>إضافة منطقة</Button>
        </div>

        {/* City filter */}
        <div className="flex gap-3">
          <select
            className="rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            value={cityFilter || ''}
            onChange={(e) => setCityFilter(Number(e.target.value) || undefined)}
          >
            <option value="">كل المدن</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.nameAr}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => <CardSkeleton key={i} />)
        ) : isError ? (
          <ErrorAlert message="فشل تحميل المناطق" onRetry={() => refetch()} />
        ) : areas.length === 0 ? (
          <EmptyState title="لا توجد مناطق" description="لم يتم إضافة مناطق بعد." />
        ) : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="p-3 text-right">المنطقة</th>
                  <th className="p-3 text-right">المدينة</th>
                  <th className="p-3 text-right">الحالة</th>
                  <th className="p-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {areas.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="p-3 font-medium">{a.nameAr}</td>
                    <td className="p-3 text-gray-500">{a.city?.nameAr ?? ''}</td>
                    <td className="p-3">
                      <span className={`rounded px-2 py-0.5 text-xs ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {a.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" onClick={() => deleteMut.mutate({ id: a.id })}>
                        تعطيل
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Add modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">إضافة منطقة جديدة</h3>
              <div className="space-y-3">
                <select
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  value={newArea.cityId}
                  onChange={(e) => setNewArea({ ...newArea, cityId: e.target.value })}
                >
                  <option value="">اختر المدينة</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.nameAr}</option>
                  ))}
                </select>
                <Input value={newArea.nameAr} onChange={(e) => setNewArea({ ...newArea, nameAr: e.target.value })} placeholder="اسم المنطقة (عربي)" />
                <Input value={newArea.nameEn} onChange={(e) => setNewArea({ ...newArea, nameEn: e.target.value })} placeholder="اسم المنطقة (إنجليزي)" />
                <div className="flex gap-3">
                  <Button onClick={handleAdd} loading={createMut.isPending} className="flex-1">حفظ</Button>
                  <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
