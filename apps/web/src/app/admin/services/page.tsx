'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import {
  Button,
  Card,
  CardSkeleton,
  ErrorAlert,
  EmptyState,
  Input,
  Modal,
  formatCurrency,
} from '@galaxy/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceItem = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CategoryItem = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VariantItem = Record<string, any>;

interface ServiceForm {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  basePrice: number;
  durationMin: number;
  categoryId: number;
  imageUrl: string;
  isPopular: boolean;
}

const emptyForm: ServiceForm = {
  titleAr: '',
  titleEn: '',
  descriptionAr: '',
  descriptionEn: '',
  basePrice: 0,
  durationMin: 30,
  categoryId: 0,
  imageUrl: '',
  isPopular: false,
};

// Variant form matches the actual schema field names
interface VariantForm {
  nameAr: string;
  nameEn: string;
  priceDelta: number;
  durationDelta: number;
}

const emptyVariantForm: VariantForm = {
  nameAr: '',
  nameEn: '',
  priceDelta: 0,
  durationDelta: 0,
};

const STATUSES = ['ALL', 'ACTIVE', 'INACTIVE'] as const;

export default function AdminServicesPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState<VariantForm>(emptyVariantForm);

  const { data, isLoading, isError, refetch } = api.services.list.useQuery({ limit: 50 });
  const createMut = api.services.create.useMutation({
    onSuccess: () => {
      refetch();
      setCreateOpen(false);
      setForm(emptyForm);
    },
  });
  const updateMut = api.services.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditOpen(false);
      setSelected(null);
    },
  });
  const deleteMut = api.services.delete.useMutation({ onSuccess: () => refetch() });
  const addVariantMut = api.services.createVariant.useMutation({ onSuccess: () => refetch() });
  const removeVariantMut = api.services.deleteVariant.useMutation({ onSuccess: () => refetch() });

  const catsQuery = api.categories.all.useQuery();
  const categories: CategoryItem[] = catsQuery.data ?? [];
  const services: ServiceItem[] = data?.items ?? [];

  const filtered = services.filter((s) => {
    // titleJson is a Json field: { ar: string, en: string }
    const titles = s.titleJson as { ar?: string; en?: string };
    if (search && !titles.ar?.includes(search) && !titles.en?.includes(search)) return false;
    if (catFilter && s.categoryId !== catFilter) return false;
    if (statusFilter === 'ACTIVE' && !s.isActive) return false;
    if (statusFilter === 'INACTIVE' && s.isActive) return false;
    return true;
  });

  const handleCreate = () => {
    if (!form.categoryId) return;
    createMut.mutate({
      categoryId: form.categoryId,
      titleAr: form.titleAr,
      titleEn: form.titleEn,
      descriptionAr: form.descriptionAr || undefined,
      descriptionEn: form.descriptionEn || undefined,
      basePrice: form.basePrice,
      durationMin: form.durationMin,
      imageUrl: form.imageUrl || undefined,
      isPopular: form.isPopular,
    });
  };

  const handleUpdate = () => {
    if (!selected || !form.categoryId) return;
    updateMut.mutate({
      id: selected.id,
      categoryId: form.categoryId,
      titleAr: form.titleAr,
      titleEn: form.titleEn,
      descriptionAr: form.descriptionAr || undefined,
      descriptionEn: form.descriptionEn || undefined,
      basePrice: form.basePrice,
      durationMin: form.durationMin,
      imageUrl: form.imageUrl || undefined,
      isPopular: form.isPopular,
    });
  };

  const handleDelete = (svc: ServiceItem) => {
    deleteMut.mutate({ id: svc.id });
  };

  const openEdit = (svc: ServiceItem) => {
    setSelected(svc);
    const titles = svc.titleJson as { ar?: string; en?: string };
    const descs = (svc.descriptionJson ?? {}) as { ar?: string; en?: string };
    setForm({
      titleAr: titles.ar ?? '',
      titleEn: titles.en ?? '',
      descriptionAr: descs.ar ?? '',
      descriptionEn: descs.en ?? '',
      basePrice: Number(svc.basePrice ?? 0),
      durationMin: svc.durationMin,
      categoryId: svc.categoryId,
      imageUrl: svc.imageUrl ?? '',
      isPopular: svc.isPopular,
    });
    setEditOpen(true);
  };

  const handleAddVariant = (serviceId: number) => {
    addVariantMut.mutate({
      serviceId,
      nameAr: variantForm.nameAr,
      nameEn: variantForm.nameEn,
      priceDelta: variantForm.priceDelta,
      durationDelta: variantForm.durationDelta,
    });
    setVariantForm(emptyVariantForm);
  };

  const getVariants = (svc: ServiceItem): VariantItem[] =>
    (svc.variants as VariantItem[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
        <Button
          variant="primary"
          onClick={() => {
            setForm(emptyForm);
            setCreateOpen(true);
          }}
        >
          إضافة خدمة
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="بحث عن خدمة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <div>
          <label htmlFor="as-cat-filter" className="mb-1 block text-xs text-text-secondary">التصنيف</label>
          <select
            id="as-cat-filter"
            className="rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            value={catFilter ?? ''}
            onChange={(e) => setCatFilter(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">جميع التصنيفات</option>
            {categories.map((c) => {
              const name = (c.nameJson as { ar?: string }).ar ?? '';
              return (
                <option key={c.id} value={c.id}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary dark:bg-gray-800 dark:text-gray-400'}`}
            >
              {s === 'ALL' ? 'الكل' : s === 'ACTIVE' ? 'نشط' : 'غير نشط'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : isError ? (
        <ErrorAlert message="فشل تحميل الخدمات" onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <>
          <EmptyState title="لا توجد خدمات" />
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            إضافة خدمة
          </Button>
        </>
      ) : (
        <div className="space-y-2">
          {filtered.map((svc) => {
            const titles = svc.titleJson as { ar?: string; en?: string };
            const catName =
              (
                categories.find((c) => c.id === svc.categoryId)?.nameJson as
                  { ar?: string } | undefined
              )?.ar ?? 'بدون تصنيف';
            const variantCount = getVariants(svc).length;

            return (
              <div key={svc.id}>
                <Card padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">
                        {titles.ar ?? ''} / {titles.en ?? ''}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-text-secondary">
                        <span>{catName}</span>
                        <span>{formatCurrency(Number(svc.basePrice ?? 0))}</span>
                        <span>{svc.durationMin} دقيقة</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {svc.isPopular && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          مشهور
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {svc.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                      <button
                        className="text-xs text-brand-600 hover:underline"
                        onClick={() => setExpandedId(expandedId === svc.id ? null : svc.id)}
                      >
                        {expandedId === svc.id ? 'إخفاء المتغيرات' : 'عرض المتغيرات'}
                      </button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(svc)}>
                        تعديل
                      </Button>
                      {svc.isActive && (
                        <Button size="sm" variant="danger" onClick={() => handleDelete(svc)}>
                          حذف
                        </Button>
                      )}
                    </div>
                  </div>

                  {expandedId === svc.id && (
                    <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                      <h4 className="mb-2 text-sm font-semibold">المتغيرات</h4>
                      {variantCount === 0 ? (
                        <p className="mb-2 text-xs text-text-secondary">لا توجد متغيرات</p>
                      ) : (
                        <div className="mb-3 space-y-1">
                          {getVariants(svc).map((v: VariantItem) => {
                            const vNames = v.nameJson as { ar?: string; en?: string };
                            return (
                              <div
                                key={v.id}
                                className="flex items-center justify-between rounded bg-surface-muted px-3 py-1.5 text-sm dark:bg-gray-900"
                              >
                                <span>
                                  {vNames.ar ?? ''} / {vNames.en ?? ''}
                                </span>
                                <span>
                                  {formatCurrency(Number(v.priceDelta ?? 0))} -{' '}
                                  {v.durationDelta ?? 0} دقيقة
                                </span>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => removeVariantMut.mutate({ id: v.id })}
                                >
                                  حذف
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="flex flex-wrap items-end gap-2">
                        <Input
                          placeholder="اسم المتغير (عربي)"
                          value={variantForm.nameAr}
                          onChange={(e) =>
                            setVariantForm({ ...variantForm, nameAr: e.target.value })
                          }
                          className="w-36"
                        />
                        <Input
                          placeholder="اسم المتغير (إنجليزي)"
                          value={variantForm.nameEn}
                          onChange={(e) =>
                            setVariantForm({ ...variantForm, nameEn: e.target.value })
                          }
                          className="w-36"
                        />
                        <Input
                          placeholder="فرق السعر"
                          type="number"
                          value={variantForm.priceDelta}
                          onChange={(e) =>
                            setVariantForm({ ...variantForm, priceDelta: Number(e.target.value) })
                          }
                          className="w-24"
                        />
                        <Input
                          placeholder="فرق المدة (دقيقة)"
                          type="number"
                          value={variantForm.durationDelta}
                          onChange={(e) =>
                            setVariantForm({
                              ...variantForm,
                              durationDelta: Number(e.target.value),
                            })
                          }
                          className="w-28"
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAddVariant(svc.id)}
                          loading={addVariantMut.isPending}
                        >
                          إضافة
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="إضافة خدمة جديدة">
        <div className="space-y-4">
          <Input
            label="العنوان (عربي)"
            value={form.titleAr}
            onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
          />
          <Input
            label="العنوان (إنجليزي)"
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          />
          <Input
            label="الوصف (عربي)"
            value={form.descriptionAr}
            onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
          />
          <Input
            label="الوصف (إنجليزي)"
            value={form.descriptionEn}
            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          />
          <Input
            label="السعر الأساسي"
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
          />
          <Input
            label="المدة (دقيقة)"
            type="number"
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
          />
          <div>
            <label htmlFor="as-cat-create" className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">
              التصنيف
            </label>
            <select
              id="as-cat-create"
              className="w-full rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={form.categoryId || ''}
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) || 0 })}
            >
              <option value="">-- اختر تصنيف --</option>
              {categories.map((c) => {
                const name = (c.nameJson as { ar?: string }).ar ?? '';
                return (
                  <option key={c.id} value={c.id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
          <Input
            label="رابط الصورة"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPopular}
              onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
            />
            خدمة مشهورة
          </label>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCreate} loading={createMut.isPending}>
              حفظ
            </Button>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="تعديل الخدمة">
        <div className="space-y-4">
          <Input
            label="العنوان (عربي)"
            value={form.titleAr}
            onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
          />
          <Input
            label="العنوان (إنجليزي)"
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          />
          <Input
            label="الوصف (عربي)"
            value={form.descriptionAr}
            onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
          />
          <Input
            label="الوصف (إنجليزي)"
            value={form.descriptionEn}
            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          />
          <Input
            label="السعر الأساسي"
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
          />
          <Input
            label="المدة (دقيقة)"
            type="number"
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
          />
          <div>
            <label htmlFor="as-cat-edit" className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">
              التصنيف
            </label>
            <select
              id="as-cat-edit"
              className="w-full rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={form.categoryId || ''}
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) || 0 })}
            >
              <option value="">-- اختر تصنيف --</option>
              {categories.map((c) => {
                const name = (c.nameJson as { ar?: string }).ar ?? '';
                return (
                  <option key={c.id} value={c.id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
          <Input
            label="رابط الصورة"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPopular}
              onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
            />
            خدمة مشهورة
          </label>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleUpdate} loading={updateMut.isPending}>
              تحديث
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
