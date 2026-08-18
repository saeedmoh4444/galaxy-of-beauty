'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { Button, Card, CardListSkeleton, ErrorAlert, EmptyState, Input, Modal } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type CategoryItem = RouterOutputs['categories']['all'][number];

function getCatName(cat: CategoryItem, lang: 'ar' | 'en'): string {
  const nameJson = cat.nameJson as { ar?: string; en?: string } | null;
  return nameJson?.[lang] ?? '';
}

export default function AdminCategoriesPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading, isError, refetch } = api.categories.all.useQuery();
  const createMut = api.categories.create.useMutation({
    onSuccess: () => {
      refetch();
      setCreateOpen(false);
      setForm({ nameAr: '', nameEn: '', slug: '', parentId: null });
    },
  });
  const updateMut = api.categories.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditOpen(false);
      setSelected(null);
    },
  });
  const deleteMut = api.categories.delete.useMutation({ onSuccess: () => refetch() });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState({
    nameAr: '',
    nameEn: '',
    slug: '',
    parentId: null as number | null,
  });

  const categories: CategoryItem[] = data ?? [];

  const parentCategories = categories.filter((c) => !c.parentId);

  const childrenOf = (parentId: number): CategoryItem[] =>
    categories.filter((c) => Number(c.parentId) === parentId);

  const handleCreate = () => {
    const input = { ...form, parentId: form.parentId ?? undefined };
    createMut.mutate(input);
  };
  const handleUpdate = () => {
    if (!selected) return;
    const input = { id: selected.id, ...form, parentId: form.parentId ?? undefined };
    updateMut.mutate(input);
  };
  const handleDelete = (cat: CategoryItem) => deleteMut.mutate({ id: cat.id });

  const openEdit = (cat: CategoryItem) => {
    setSelected(cat);
    const nameJson = cat.nameJson as { ar?: string; en?: string };
    setForm({
      nameAr: nameJson.ar ?? '',
      nameEn: nameJson.en ?? '',
      slug: cat.slug,
      parentId: cat.parentId ?? null,
    });
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.categories.title')}</h1>
        <Button
          variant="primary"
          onClick={() => {
            setForm({ nameAr: '', nameEn: '', slug: '', parentId: null });
            setCreateOpen(true);
          }}
        >
          {t('admin.categories.add-category')}
        </Button>
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message={t('admin.categories.load-error')} onRetry={() => refetch()} />
      ) : categories.length === 0 ? (
        <>
          <EmptyState title={t('admin.categories.empty')} />
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            {t('admin.categories.add-first')}
          </Button>
        </>
      ) : (
        <div className="space-y-2">
          {parentCategories.map((cat: CategoryItem) => (
            <div key={cat.id}>
              <Card padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {getCatName(cat, 'ar')} / {getCatName(cat, 'en')}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {t('admin.categories.slug-label', { slug: cat.slug })}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {t('admin.categories.sort-order', { order: String(cat.sortOrder ?? 0) })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {cat.isActive ? t('status.active') : t('status.inactive')}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>
                      {t('button.edit')}
                    </Button>
                    {Boolean(cat.isActive) && (
                      <Button size="sm" variant="danger" onClick={() => handleDelete(cat)}>
                        {t('button.delete')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
              {childrenOf(cat.id).map((child: CategoryItem) => (
                <div key={child.id} className="mr-6">
                  <Card padding="md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          ↳ {getCatName(child, 'ar')} / {getCatName(child, 'en')}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {t('admin.categories.slug-label', { slug: child.slug })}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {t('admin.categories.sort-order', {
                            order: String(child.sortOrder ?? 0),
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${child.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {child.isActive ? t('status.active') : t('status.inactive')}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => openEdit(child)}>
                          {t('button.edit')}
                        </Button>
                        {Boolean(child.isActive) && (
                          <Button size="sm" variant="danger" onClick={() => handleDelete(child)}>
                            {t('button.delete')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('admin.categories.add-title')}
      >
        <div className="space-y-4">
          <Input
            label={t('admin.categories.name-ar')}
            value={form.nameAr}
            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
          />
          <Input
            label={t('admin.categories.name-en')}
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          />
          <Input
            label={t('admin.categories.slug-input')}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <div>
            <label
              htmlFor="ac-parent-create"
              className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300"
            >
              {t('admin.categories.parent-category')}
            </label>
            <select
              id="ac-parent-create"
              className="w-full rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={form.parentId ?? ''}
              onChange={(e) =>
                setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : null })
              }
            >
              <option value="">{t('admin.categories.no-parent')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCatName(c, 'ar')}
                </option>
              ))}
            </select>
          </div>
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
        title={t('admin.categories.edit-title')}
      >
        <div className="space-y-4">
          <Input
            label={t('admin.categories.name-ar')}
            value={form.nameAr}
            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
          />
          <Input
            label={t('admin.categories.name-en')}
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          />
          <Input
            label={t('admin.categories.slug-input')}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <div>
            <label
              htmlFor="ac-parent-edit"
              className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300"
            >
              {t('admin.categories.parent-category')}
            </label>
            <select
              id="ac-parent-edit"
              className="w-full rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={form.parentId ?? ''}
              onChange={(e) =>
                setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : null })
              }
            >
              <option value="">{t('admin.categories.no-parent')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCatName(c, 'ar')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleUpdate} loading={updateMut.isPending}>
              {t('admin.categories.update')}
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
