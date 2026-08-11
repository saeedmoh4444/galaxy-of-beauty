'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const CONDITIONS = ['جافة', 'دهنية', 'مختلطة', 'متهيجة', 'صحية', 'مجعدة', 'مرطبة'];

export default function SkinDiaryPage(): JSX.Element {
  const {
    data: entries,
    isLoading,
    isError,
    refetch,
  } = api.skinDiary.entries.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: timeline } = api.skinDiary.timeline.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const addMut = api.skinDiary.add.useMutation({
    onSuccess: () => {
      setShowAdd(false);
      refetch();
    },
  });
  const deleteMut = api.skinDiary.delete.useMutation({ onSuccess: () => refetch() });

  const [showAdd, setShowAdd] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [condition, setCondition] = useState('صحية');
  const [hydration, setHydration] = useState(5);
  const [notes, setNotes] = useState('');

  const items = (entries ?? []) as Array<Record<string, unknown>>;
  const timelineData = (timeline ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🧬 يوميات البشرة</h1>
            <p className="mt-1 text-sm text-text-secondary">
              تابعي تطور بشرتكِ مع الوقت — صور وملاحظات أسبوعية
            </p>
          </div>
          <Button onClick={() => setShowAdd(true)}>+ إضافة</Button>
        </div>

        {/* Timeline Chart */}
        {timelineData.length > 1 && (
          <Card padding="lg">
            <h3 className="font-bold mb-4">📈 مستوى الترطيب</h3>
            <div className="flex items-end gap-1 h-24">
              {timelineData
                .slice(0, 14)
                .reverse()
                .map((d: Record<string, unknown>) => {
                  const h = ((d.hydration as number) || 5) * 20;
                  return (
                    <div key={d.date as string} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-blue-400 to-cyan-400"
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[9px] text-text-tertiary">
                        {new Date(d.date as string).toLocaleDateString('ar-SA', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            title="لا توجد إدخالات"
            description="أضيفي أول صورة لبشرتكِ لبدء تتبع التحسن"
            action={{ label: 'إضافة', onPress: () => setShowAdd(true) }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e: Record<string, unknown>) => (
              <Card key={e.id as number} padding="md" className="group">
                <div className="h-36 rounded-xl bg-surface-muted dark:bg-gray-800 overflow-hidden">
                  <img src={e.imageUrl as string} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded-full bg-brand-100 dark:bg-brand-900 px-2 py-0.5 text-xs font-medium">
                    {e.skinCondition as string}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {new Date(e.date as string).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-xs text-text-secondary">💧 {e.hydration as number}/10</span>
                  {(e.concerns as string[])?.map((c: string) => (
                    <span key={c} className="text-[10px] text-red-500">
                      •{c}
                    </span>
                  ))}
                </div>
                {(e.notes as string) ? (
                  <p className="text-xs text-text-tertiary mt-1 line-clamp-1">
                    {e.notes as string}
                  </p>
                ) : null}
                <button
                  onClick={() => deleteMut.mutate({ id: e.id as number })}
                  className="mt-2 text-xs text-red-400 hover:text-red-600"
                >
                  🗑️ حذف
                </button>
              </Card>
            ))}
          </div>
        )}

        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إضافة للبوميات">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">رابط الصورة</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">حالة البشرة</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              >
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">الترطيب: {hydration}/10</label>
              <input
                type="range"
                min={1}
                max={10}
                value={hydration}
                onChange={(e) => setHydration(parseInt(e.target.value))}
                className="w-full accent-brand-600 mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">ملاحظات</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
                rows={2}
              />
            </div>
            <Button
              onClick={() => {
                if (imageUrl)
                  addMut.mutate({
                    imageUrl,
                    skinCondition: condition,
                    hydration,
                    notes: notes || undefined,
                  });
              }}
              loading={addMut.isPending}
              className="w-full"
            >
              💾 حفظ
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
