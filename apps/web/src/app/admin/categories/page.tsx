'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, Input, Modal } from '@galaxy/shared';

export default function AdminCategoriesPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.categories.all.useQuery({} as never);
  const createMut = api.categories.create.useMutation({ onSuccess: () => { refetch(); setCreateOpen(false); setForm({ nameAr: '', nameEn: '', slug: '', parentId: null }); } });
  const updateMut = api.categories.update.useMutation({ onSuccess: () => { refetch(); setEditOpen(false); setSelected(null); } });
  const deleteMut = api.categories.delete.useMutation({ onSuccess: () => refetch() });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', slug: '', parentId: null as number | null });

  const categories = (data as unknown as Record<string, unknown>[]) ?? [];

  const parentCategories = categories.filter((c) => !c.parentId);

  const childrenOf = (parentId: number): Record<string, unknown>[] =>
    categories.filter((c) => Number(c.parentId) === parentId);

  const handleCreate = () => createMut.mutate(form as never);
  const handleUpdate = () => {
    if (!selected) return;
    updateMut.mutate({ id: selected.id as number, ...form } as never);
  };
  const handleDelete = (cat: Record<string, unknown>) => deleteMut.mutate({ id: cat.id as number } as never);

  const openEdit = (cat: Record<string, unknown>) => {
    setSelected(cat);
    setForm({ nameAr: cat.nameAr as string, nameEn: cat.nameEn as string, slug: cat.slug as string, parentId: cat.parentId as number | null });
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الأقسام</h1>
        <Button variant="primary" onClick={() => { setForm({ nameAr: '', nameEn: '', slug: '', parentId: null }); setCreateOpen(true); }}>إضافة قسم</Button>
      </div>

      {isLoading ? <CardSkeleton />
      : isError ? <ErrorAlert message="فشل تحميل الأقسام" onRetry={() => refetch()} />
      : categories.length === 0 ? (
        <>
          <EmptyState title="لا توجد أقسام" />
          <Button variant="primary" onClick={() => setCreateOpen(true)}>إضافة القسم الأول</Button>
        </>
      ) : (
        <div className="space-y-2">
          {parentCategories.map((cat: Record<string, unknown>) => (
            <div key={cat.id as number}>
              <Card padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{cat.nameAr as string} / {cat.nameEn as string}</p>
                    <p className="text-sm text-gray-500">المعرف: {cat.slug as string}</p>
                    <p className="text-sm text-gray-500">الترتيب: {String(cat.sortOrder ?? 0)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${Boolean(cat.isActive) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {Boolean(cat.isActive) ? 'نشط' : 'غير نشط'}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>تعديل</Button>
                    {Boolean(cat.isActive) && (
                      <Button size="sm" variant="danger" onClick={() => handleDelete(cat)}>حذف</Button>
                    )}
                  </div>
                </div>
              </Card>
              {childrenOf(cat.id as number).map((child: Record<string, unknown>) => (
                <div key={child.id as number} className="mr-6">
                  <Card padding="md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">↳ {child.nameAr as string} / {child.nameEn as string}</p>
                        <p className="text-sm text-gray-500">المعرف: {child.slug as string}</p>
                        <p className="text-sm text-gray-500">الترتيب: {String(child.sortOrder ?? 0)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${child.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {child.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => openEdit(child)}>تعديل</Button>
                        {Boolean(child.isActive) && (
                          <Button size="sm" variant="danger" onClick={() => handleDelete(child)}>حذف</Button>
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
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="إضافة قسم جديد">
        <div className="space-y-4">
          <Input label="الاسم (عربي)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
          <Input label="الاسم (إنجليزي)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          <Input label="المعرف (Slug)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">القسم الأب</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={form.parentId ?? ''}
              onChange={(e) => setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">-- لا يوجد (قسم رئيسي) --</option>
              {categories.map((c) => (
                <option key={c.id as number} value={c.id as number}>{c.nameAr as string}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCreate} loading={createMut.isPending}>حفظ</Button>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>إلغاء</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="تعديل القسم">
        <div className="space-y-4">
          <Input label="الاسم (عربي)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
          <Input label="الاسم (إنجليزي)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          <Input label="المعرف (Slug)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">القسم الأب</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={form.parentId ?? ''}
              onChange={(e) => setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">-- لا يوجد (قسم رئيسي) --</option>
              {categories.map((c) => (
                <option key={c.id as number} value={c.id as number}>{c.nameAr as string}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleUpdate} loading={updateMut.isPending}>تحديث</Button>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
