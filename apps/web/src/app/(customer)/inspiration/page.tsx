/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { api } from '@/lib/trpc';
import {
  Card,
  ErrorAlert,
  EmptyState,
  Button,
  Input,
  PageContainer,
  DashboardSkeleton,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';
import { SortableGrid } from '@/components/SortableGrid';

export default function InspirationPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.inspiration.list.useQuery();
  const createMut = api.inspiration.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAdd(false);
      setForm({ imageUrl: '', title: '', notes: '', tags: '' });
      addToast('success', 'تمت الإضافة');
    },
  });
  const deleteMut = api.inspiration.delete.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', 'تم الحذف');
    },
  });
  const reorderMut = api.inspiration.reorder.useMutation();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ imageUrl: '', title: '', notes: '', tags: '' });
  const [orderedPins, setOrderedPins] = useState<Array<Record<string, any>> | null>(null);

  const allPins = (data ?? []) as Array<Record<string, any>>;
  // Use local order when user has reordered, otherwise server order
  const pins = orderedPins && orderedPins.length === allPins.length ? orderedPins : allPins;

  const handleReorder = useCallback(
    (newPins: Array<Record<string, any>>) => {
      setOrderedPins(newPins);
      // Optimistic — persist the new order; the server list orders by sortOrder
      reorderMut.mutate({ pinIds: newPins.map((p) => p.id as number) });
    },
    [reorderMut],
  );

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">لوحة الإلهام</h1>
            <p className="mt-1 text-sm text-text-secondary">
              اسحبي الصور لإعادة ترتيبها · {pins.length} صورة
            </p>
          </div>
          <Button onClick={() => setShowAdd(true)}>إضافة إلهام</Button>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
        ) : pins.length === 0 ? (
          <EmptyState
            title="لا توجد دبابيس"
            description="احفظي الصور والأفكار اللي تعجبكِ لموعدكِ القادم"
            action={{ label: 'أضيفي أول إلهام', onPress: () => setShowAdd(true) }}
          />
        ) : (
          <SortableGrid
            items={pins}
            getItemId={(p) => p.id as number}
            onReorder={handleReorder}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            gap="gap-4"
          >
            {(p: Record<string, any>) => (
              <Card
                key={p.id}
                padding="md"
                className="relative group cursor-grab active:cursor-grabbing"
              >
                {/* Drag handle indicator */}
                <div
                  className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="9" cy="5" r="2" />
                    <circle cx="15" cy="5" r="2" />
                    <circle cx="9" cy="12" r="2" />
                    <circle cx="15" cy="12" r="2" />
                    <circle cx="9" cy="19" r="2" />
                    <circle cx="15" cy="19" r="2" />
                  </svg>
                  اسحبي للترتيب
                </div>

                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.title || ''}
                    width={800}
                    height={320}
                    className="mb-3 h-40 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className="mb-3 flex h-40 items-center justify-center rounded-xl bg-surface-muted text-4xl dark:bg-gray-800"
                    aria-hidden="true"
                  ></div>
                )}

                {p.title && <h3 className="font-semibold text-text-primary">{p.title}</h3>}
                {p.notes && (
                  <p className="mt-1 text-sm text-text-secondary line-clamp-2">{p.notes}</p>
                )}
                {p.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(p.tags as string[]).map((t: string) => (
                      <span
                        key={t}
                        className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600 dark:bg-brand-950 dark:text-brand-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMut.mutate({ id: p.id });
                    setOrderedPins(null);
                  }}
                  className="absolute top-2 right-2 hidden rounded-full bg-red-500 p-1.5 text-white shadow-sm transition-colors hover:bg-red-600 group-hover:block"
                  aria-label="حذف"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Card>
            )}
          </SortableGrid>
        )}

        {showAdd && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAdd(false);
            }}
            role="button"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowAdd(false);
            }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-bold text-text-primary">إضافة إلهام جديد</h3>
              <div className="space-y-3">
                <Input
                  placeholder="رابط الصورة"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
                <Input
                  placeholder="العنوان"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <Input
                  placeholder="ملاحظات"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
                <Input
                  placeholder="وسوم (مفصولة بفواصل)"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
                <Button
                  onClick={() =>
                    createMut.mutate({
                      ...form,
                      tags: form.tags
                        .split(',')
                        .map((t: string) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  loading={createMut.isPending}
                  className="w-full"
                >
                  حفظ
                </Button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
