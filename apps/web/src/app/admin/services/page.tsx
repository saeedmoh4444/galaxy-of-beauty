'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import {
  Button,
  Card,
  CardListSkeleton,
  ErrorAlert,
  EmptyState,
  Input,
  Modal,
  formatCurrency,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type ServiceItem = RouterOutputs['services']['list']['items'][number];
type CategoryItem = RouterOutputs['categories']['all'][number];
type VariantItem = RouterOutputs['services']['list']['items'][number]['variants'][number];

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
  const { t } = useLocale();
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

  const getVariants = (svc: ServiceItem): VariantItem[] => svc.variants ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.services.title')}</h1>
        <Button
          variant="primary"
          onClick={() => {
            setForm(emptyForm);
            setCreateOpen(true);
          }}
        >
          {t('admin.services.add-service')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder={t('admin.services.search-placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <div>
          <label htmlFor="as-cat-filter" className="mb-1 block text-xs text-text-secondary">
            {t('admin.services.category')}
          </label>
          <select
            id="as-cat-filter"
            className="rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            value={catFilter ?? ''}
            onChange={(e) => setCatFilter(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('admin.services.all-categories')}</option>
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
              {s === 'ALL'
                ? t('admin.all')
                : s === 'ACTIVE'
                  ? t('status.active')
                  : t('status.inactive')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message={t('admin.services.load-error')} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <>
          <EmptyState title={t('admin.services.empty')} />
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            {t('admin.services.add-service')}
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
              )?.ar ?? t('admin.services.uncategorized');
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
                        <span>
                          {t('admin.services.duration-min', { minutes: svc.durationMin })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {svc.isPopular && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          {t('admin.services.popular')}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {svc.isActive ? t('status.active') : t('status.inactive')}
                      </span>
                      <button
                        className="text-xs text-brand-600 hover:underline"
                        onClick={() => setExpandedId(expandedId === svc.id ? null : svc.id)}
                      >
                        {expandedId === svc.id
                          ? t('admin.services.hide-variants')
                          : t('admin.services.show-variants')}
                      </button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(svc)}>
                        {t('button.edit')}
                      </Button>
                      {svc.isActive && (
                        <Button size="sm" variant="danger" onClick={() => handleDelete(svc)}>
                          {t('button.delete')}
                        </Button>
                      )}
                    </div>
                  </div>

                  {expandedId === svc.id && (
                    <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                      <h4 className="mb-2 text-sm font-semibold">{t('admin.services.variants')}</h4>
                      {variantCount === 0 ? (
                        <p className="mb-2 text-xs text-text-secondary">
                          {t('admin.services.no-variants')}
                        </p>
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
                                  {t('admin.services.duration-min', {
                                    minutes: v.durationDelta ?? 0,
                                  })}
                                </span>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => removeVariantMut.mutate({ id: v.id })}
                                >
                                  {t('button.delete')}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="flex flex-wrap items-end gap-2">
                        <Input
                          placeholder={t('admin.services.variant-name-ar')}
                          value={variantForm.nameAr}
                          onChange={(e) =>
                            setVariantForm({ ...variantForm, nameAr: e.target.value })
                          }
                          className="w-36"
                        />
                        <Input
                          placeholder={t('admin.services.variant-name-en')}
                          value={variantForm.nameEn}
                          onChange={(e) =>
                            setVariantForm({ ...variantForm, nameEn: e.target.value })
                          }
                          className="w-36"
                        />
                        <Input
                          placeholder={t('admin.services.price-delta')}
                          type="number"
                          value={variantForm.priceDelta}
                          onChange={(e) =>
                            setVariantForm({ ...variantForm, priceDelta: Number(e.target.value) })
                          }
                          className="w-24"
                        />
                        <Input
                          placeholder={t('admin.services.duration-delta')}
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
                          {t('admin.services.add-variant')}
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
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('admin.services.add-title')}
      >
        <div className="space-y-4">
          <Input
            label={t('admin.services.title-ar')}
            value={form.titleAr}
            onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
          />
          <Input
            label={t('admin.services.title-en')}
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          />
          <Input
            label={t('admin.services.description-ar')}
            value={form.descriptionAr}
            onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
          />
          <Input
            label={t('admin.services.description-en')}
            value={form.descriptionEn}
            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          />
          <Input
            label={t('admin.services.base-price')}
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
          />
          <Input
            label={t('admin.services.duration-min-label')}
            type="number"
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
          />
          <div>
            <label
              htmlFor="as-cat-create"
              className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300"
            >
              {t('admin.services.category')}
            </label>
            <select
              id="as-cat-create"
              className="w-full rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={form.categoryId || ''}
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) || 0 })}
            >
              <option value="">{t('admin.services.select-category')}</option>
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
            label={t('admin.services.image-url')}
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPopular}
              onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
            />
            {t('admin.services.popular-label')}
          </label>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCreate} loading={createMut.isPending}>
              {t('button.save')}
            </Button>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              {t('button.cancel')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t('admin.services.edit-title')}
      >
        <div className="space-y-4">
          <Input
            label={t('admin.services.title-ar')}
            value={form.titleAr}
            onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
          />
          <Input
            label={t('admin.services.title-en')}
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          />
          <Input
            label={t('admin.services.description-ar')}
            value={form.descriptionAr}
            onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
          />
          <Input
            label={t('admin.services.description-en')}
            value={form.descriptionEn}
            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          />
          <Input
            label={t('admin.services.base-price')}
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
          />
          <Input
            label={t('admin.services.duration-min-label')}
            type="number"
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
          />
          <div>
            <label
              htmlFor="as-cat-edit"
              className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300"
            >
              {t('admin.services.category')}
            </label>
            <select
              id="as-cat-edit"
              className="w-full rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={form.categoryId || ''}
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) || 0 })}
            >
              <option value="">{t('admin.services.select-category')}</option>
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
            label={t('admin.services.image-url')}
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPopular}
              onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
            />
            {t('admin.services.popular-label')}
          </label>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleUpdate} loading={updateMut.isPending}>
              {t('admin.services.update')}
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              {t('button.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
