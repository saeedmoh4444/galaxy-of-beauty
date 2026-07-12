'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, Input, Modal, formatCurrency } from '@galaxy/shared';

interface ServiceForm {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  basePrice: number;
  durationMin: number;
  categoryId: number | null;
  imageUrl: string;
  isPopular: boolean;
}

const emptyForm: ServiceForm = {
  titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
  basePrice: 0, durationMin: 30, categoryId: null, imageUrl: '', isPopular: false,
};

const STATUSES = ['ALL', 'ACTIVE', 'INACTIVE'] as const;

export default function AdminServicesPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState({ titleAr: '', titleEn: '', price: 0, durationMin: 30 });

  const { data, isLoading, isError, refetch } = api.services.list.useQuery({ limit: 50 } as never);
  const createMut = api.services.create.useMutation({ onSuccess: () => { refetch(); setCreateOpen(false); setForm(emptyForm); } });
  const updateMut = api.services.update.useMutation({ onSuccess: () => { refetch(); setEditOpen(false); setSelected(null); } });
  const deleteMut = api.services.delete.useMutation({ onSuccess: () => refetch() });
  const addVariantMut = api.services.createVariant.useMutation({ onSuccess: () => refetch() });
  const removeVariantMut = api.services.deleteVariant.useMutation({ onSuccess: () => refetch() });

  const catsQuery = api.categories.all.useQuery({} as never);
  const categories = (catsQuery.data as unknown as Record<string, unknown>[]) ?? [];
  const services = (data as unknown as Record<string, unknown>[]) ?? [];

  const filtered = services.filter((s) => {
    if (search && !(s.titleAr as string)?.includes(search) && !(s.titleEn as string)?.includes(search)) return false;
    if (catFilter && Number(s.categoryId) !== catFilter) return false;
    if (statusFilter === 'ACTIVE' && !s.isActive) return false;
    if (statusFilter === 'INACTIVE' && s.isActive) return false;
    return true;
  });

  const handleCreate = () => createMut.mutate(form as never);
  const handleUpdate = () => {
    if (!selected) return;
    updateMut.mutate({ id: selected.id as number, ...form } as never);
  };
  const handleDelete = (svc: Record<string, unknown>) => deleteMut.mutate({ id: svc.id as number } as never);

  const openEdit = (svc: Record<string, unknown>) => {
    setSelected(svc);
    setForm({
      titleAr: svc.titleAr as string,
      titleEn: svc.titleEn as string,
      descriptionAr: svc.descriptionAr as string,
      descriptionEn: svc.descriptionEn as string,
      basePrice: Number(svc.basePrice ?? 0),
      durationMin: Number(svc.durationMin ?? 30),
      categoryId: svc.categoryId as number | null,
      imageUrl: svc.imageUrl as string ?? '',
      isPopular: Boolean(svc.isPopular),
    });
    setEditOpen(true);
  };

  const handleAddVariant = (serviceId: number) => {
    addVariantMut.mutate({ serviceId, ...variantForm } as never);
    setVariantForm({ titleAr: '', titleEn: '', price: 0, durationMin: 30 });
  };

  const variantsData = (svc: Record<string, unknown>): Record<string, unknown>[] =>
    (svc.variants as unknown as Record<string, unknown>[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
        <Button variant="primary" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>إضافة خدمة</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="بحث عن خدمة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <div>
          <label className="mb-1 block text-xs text-gray-500">التصنيف</label>
          <select
            className="rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            value={catFilter ?? ''}
            onChange={(e) => setCatFilter(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">جميع التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id as number} value={c.id as number}>{c.nameAr as string}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
            >
              {s === 'ALL' ? 'الكل' : s === 'ACTIVE' ? 'نشط' : 'غير نشط'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <CardSkeleton />
      : isError ? <ErrorAlert message="فشل تحميل الخدمات" onRetry={() => refetch()} />
      : filtered.length === 0 ? (
        <>
          <EmptyState title="لا توجد خدمات" />
          <Button variant="primary" onClick={() => setCreateOpen(true)}>إضافة خدمة</Button>
        </>
      ) : (
        <div className="space-y-2">
          {filtered.map((svc: Record<string, unknown>) => (
            <div key={svc.id as number}>
              <Card padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{svc.titleAr as string} / {svc.titleEn as string}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                      <span>{categories.find((c) => c.id === svc.categoryId)?.nameAr as string ?? 'بدون تصنيف'}</span>
                      <span>{formatCurrency(Number(svc.basePrice ?? 0))}</span>
                      <span>{String(svc.durationMin ?? 0)} دقيقة</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {Boolean(svc.isPopular) && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">مشهور</span>}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${Boolean(svc.isActive) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {Boolean(svc.isActive) ? 'نشط' : 'غير نشط'}
                    </span>
                    <button
                      className="text-xs text-brand-600 hover:underline"
                      onClick={() => setExpandedId(expandedId === (svc.id as number) ? null : svc.id as number)}
                    >
                      {expandedId === (svc.id as number) ? 'إخفاء المتغيرات' : 'عرض المتغيرات'}
                    </button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(svc)}>تعديل</Button>
                    {Boolean(svc.isActive) && <Button size="sm" variant="danger" onClick={() => handleDelete(svc)}>حذف</Button>}
                  </div>
                </div>

                {expandedId === (svc.id as number) && (
                  <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                    <h4 className="mb-2 text-sm font-semibold">المتغيرات</h4>
                    {variantsData(svc).length === 0 ? (
                      <p className="mb-2 text-xs text-gray-500">لا توجد متغيرات</p>
                    ) : (
                      <div className="mb-3 space-y-1">
                        {variantsData(svc).map((v: Record<string, unknown>) => (
                          <div key={v.id as number} className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5 text-sm dark:bg-gray-900">
                            <span>{v.titleAr as string} / {v.titleEn as string}</span>
                            <span>{formatCurrency(Number(v.price ?? 0))} - {String(v.durationMin ?? 0)} دقيقة</span>
                            <Button size="sm" variant="danger" onClick={() => removeVariantMut.mutate({ id: v.id as number } as never)}>حذف</Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-end gap-2">
                      <Input
                        placeholder="اسم المتغير (عربي)"
                        value={variantForm.titleAr}
                        onChange={(e) => setVariantForm({ ...variantForm, titleAr: e.target.value })}
                        className="w-36"
                      />
                      <Input
                        placeholder="اسم المتغير (إنجليزي)"
                        value={variantForm.titleEn}
                        onChange={(e) => setVariantForm({ ...variantForm, titleEn: e.target.value })}
                        className="w-36"
                      />
                      <Input
                        placeholder="السعر"
                        type="number"
                        value={variantForm.price}
                        onChange={(e) => setVariantForm({ ...variantForm, price: Number(e.target.value) })}
                        className="w-24"
                      />
                      <Input
                        placeholder="المدة (دقيقة)"
                        type="number"
                        value={variantForm.durationMin}
                        onChange={(e) => setVariantForm({ ...variantForm, durationMin: Number(e.target.value) })}
                        className="w-28"
                      />
                      <Button size="sm" variant="primary" onClick={() => handleAddVariant(svc.id as number)} loading={addVariantMut.isPending}>إضافة</Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="إضافة خدمة جديدة">
        <div className="space-y-4">
          <Input label="العنوان (عربي)" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
          <Input label="العنوان (إنجليزي)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
          <Input label="الوصف (عربي)" value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
          <Input label="الوصف (إنجليزي)" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          <Input label="السعر الأساسي" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
          <Input label="المدة (دقيقة)" type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">التصنيف</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={form.categoryId ?? ''}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">-- اختر تصنيف --</option>
              {categories.map((c) => (
                <option key={c.id as number} value={c.id as number}>{c.nameAr as string}</option>
              ))}
            </select>
          </div>
          <Input label="رابط الصورة" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} />
            خدمة مشهورة
          </label>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCreate} loading={createMut.isPending}>حفظ</Button>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>إلغاء</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="تعديل الخدمة">
        <div className="space-y-4">
          <Input label="العنوان (عربي)" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
          <Input label="العنوان (إنجليزي)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
          <Input label="الوصف (عربي)" value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
          <Input label="الوصف (إنجليزي)" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          <Input label="السعر الأساسي" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
          <Input label="المدة (دقيقة)" type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">التصنيف</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={form.categoryId ?? ''}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">-- اختر تصنيف --</option>
              {categories.map((c) => (
                <option key={c.id as number} value={c.id as number}>{c.nameAr as string}</option>
              ))}
            </select>
          </div>
          <Input label="رابط الصورة" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} />
            خدمة مشهورة
          </label>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleUpdate} loading={updateMut.isPending}>تحديث</Button>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
