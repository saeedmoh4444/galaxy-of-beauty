'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
interface Pin {
  id: number;
  imageUrl: string;
  title: string;
  note: string;
  tags: string[];
  serviceId: number | null;
  createdAt: string;
}

interface Board {
  id: number;
  name: string;
  description: string;
  coverUrl: string | null;
  pins: Pin[];
  createdAt: string;
}

export default function MoodBoardPage(): JSX.Element {
  const {
    data: boards,
    isLoading,
    isError,
    refetch,
  } = api.moodBoard.list.useQuery() as {
    data: Board[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const createBoardMut = api.moodBoard.create.useMutation({
    onSuccess: () => {
      setShowCreate(false);
      setNewBoardName('');
      refetch();
    },
  });
  const addPinMut = api.moodBoard.addPin.useMutation({
    onSuccess: () => {
      setShowAddPin(0);
      refetch();
    },
  });
  const _removePinMut = api.moodBoard.removePin.useMutation({ onSuccess: () => refetch() });
  const deleteBoardMut = api.moodBoard.delete.useMutation({ onSuccess: () => refetch() });

  const [showCreate, setShowCreate] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [showAddPin, setShowAddPin] = useState(0);
  const [pinImageUrl, setPinImageUrl] = useState('');
  const [pinTitle, setPinTitle] = useState('');
  const [pinNote, setPinNote] = useState('');
  const [pinTags, setPinTags] = useState('');

  const allBoards: Board[] = boards ?? [];
  const totalPins = allBoards.reduce((sum, b) => sum + b.pins.length, 0);

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;
    createBoardMut.mutate({
      name: newBoardName.trim(),
      description: newBoardDesc.trim() || undefined,
    });
  };

  const handleAddPin = () => {
    if (!pinImageUrl.trim()) return;
    addPinMut.mutate({
      boardId: showAddPin,
      imageUrl: pinImageUrl.trim(),
      title: pinTitle.trim() || undefined,
      note: pinNote.trim() || undefined,
      tags: pinTags
        ? pinTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    });
    setPinImageUrl('');
    setPinTitle('');
    setPinNote('');
    setPinTags('');
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
               لوحة الإلهام
            </h1>
            <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
              اجمعي صور إطلالاتكِ المفضلة ونظميها في لوحات — {totalPins} صورة في {allBoards.length}{' '}
              لوحة
            </p>
          </div>
          <Button
            onClick={() => {
              setNewBoardName('');
              setNewBoardDesc('');
              setShowCreate(true);
            }}
          >
            + لوحة جديدة
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل اللوحات" onRetry={() => refetch()} />
        ) : allBoards.length === 0 ? (
          <EmptyState
            title="لا توجد لوحات إلهام بعد"
            description="أنشئي أول لوحة وابدئي بجمع إطلالاتكِ المفضلة! "
            action={{ label: 'إنشاء لوحة', onPress: () => setShowCreate(true) }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allBoards.map((board) => (
              <Card key={board.id} padding="lg" className="group">
                {/* Cover */}
                <div className="relative h-44 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  {board.coverUrl ? (
                    <img
                      src={board.coverUrl}
                      alt={board.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl"></div>
                  )}
                  {/* Pin count badge */}
                  <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur">
                    {board.pins.length} صورة
                  </span>
                </div>

                {/* Info */}
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">
                    {board.name}
                  </h3>
                  {board.description && (
                    <p className="text-xs text-text-secondary mt-0.5">{board.description}</p>
                  )}
                </div>

                {/* Pin thumbnails */}
                {board.pins.length > 0 && (
                  <div className="mt-3 flex gap-1 overflow-hidden rounded-lg">
                    {board.pins.slice(0, 5).map((pin) => (
                      <div
                        key={pin.id}
                        className="h-16 flex-1 overflow-hidden bg-surface-muted dark:bg-gray-800 rounded"
                      >
                        <img
                          src={pin.imageUrl}
                          alt={pin.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                    {board.pins.length > 5 && (
                      <div className="flex h-16 w-10 shrink-0 items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-xs text-text-secondary">
                        +{board.pins.length - 5}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setShowAddPin(board.id);
                      setPinImageUrl('');
                      setPinTitle('');
                      setPinNote('');
                      setPinTags('');
                    }}
                  >
                    + إضافة صورة
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (!confirm(`هل أنتِ متأكدة من حذف لوحة "${board.name}"؟`)) return;
                      deleteBoardMut.mutate({ boardId: board.id });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ️
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Board Modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="لوحة جديدة">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                اسم اللوحة
              </label>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="مثال: إطلالات زفافي"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                الوصف (اختياري)
              </label>
              <textarea
                value={newBoardDesc}
                onChange={(e) => setNewBoardDesc(e.target.value)}
                placeholder="أفكار لإطلالة يوم الزفاف..."
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateBoard} loading={createBoardMut.isPending}>
                 إنشاء
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add Pin Modal */}
        <Modal open={showAddPin > 0} onClose={() => setShowAddPin(0)} title="إضافة صورة">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                رابط الصورة
              </label>
              <input
                type="url"
                value={pinImageUrl}
                onChange={(e) => setPinImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              />
              {pinImageUrl && (
                <div className="mt-2 h-32 rounded-xl bg-surface-muted dark:bg-gray-800 overflow-hidden">
                  <img
                    src={pinImageUrl}
                    alt="معاينة"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                العنوان (اختياري)
              </label>
              <input
                type="text"
                value={pinTitle}
                onChange={(e) => setPinTitle(e.target.value)}
                placeholder="مكياج عيون سموكي"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                وسوم (تفصل بفواصل)
              </label>
              <input
                type="text"
                value={pinTags}
                onChange={(e) => setPinTags(e.target.value)}
                placeholder="مكياج، سهرة، عيون"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowAddPin(0)}>
                إلغاء
              </Button>
              <Button onClick={handleAddPin} loading={addPinMut.isPending}>
                 تثبيت
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
