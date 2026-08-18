'use client';

import { useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const CONDITIONS: TranslationKey[] = [
  'skinDiary.condition.dry',
  'skinDiary.condition.oily',
  'skinDiary.condition.mixed',
  'skinDiary.condition.irritated',
  'skinDiary.condition.healthy',
  'skinDiary.condition.textured',
  'skinDiary.condition.hydrated',
];

export default function SkinDiaryPage(): JSX.Element {
  const { t, locale } = useLocale();
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
  const [condition, setCondition] = useState<TranslationKey>('skinDiary.condition.healthy');
  const [hydration, setHydration] = useState(5);
  const [notes, setNotes] = useState('');

  const items = (entries ?? []) as Array<Record<string, unknown>>;
  const timelineData = (timeline ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('skinDiary.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('skinDiary.subtitle')}</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>{t('skinDiary.add')}</Button>
        </div>

        {/* Timeline Chart */}
        {timelineData.length > 1 && (
          <Card padding="lg">
            <h3 className="font-bold mb-4">{t('skinDiary.hydrationTitle')}</h3>
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
                        {new Date(d.date as string).toLocaleDateString(
                          locale === 'en' ? 'en-GB' : 'ar-SA',
                          { month: 'short', day: 'numeric' },
                        )}
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {isLoading ? (
          <GridSkeleton count={6} />
        ) : isError ? (
          <ErrorAlert message={t('skinDiary.err.load')} onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            title={t('skinDiary.empty.title')}
            description={t('skinDiary.empty.desc')}
            action={{ label: t('skinDiary.empty.action'), onPress: () => setShowAdd(true) }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e: Record<string, unknown>) => (
              <Card key={e.id as number} padding="md" className="group">
                <div className="relative h-36 rounded-xl bg-surface-muted dark:bg-gray-800 overflow-hidden">
                  <Image src={e.imageUrl as string} alt="" fill className="object-cover" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded-full bg-brand-100 dark:bg-brand-900 px-2 py-0.5 text-xs font-medium">
                    {e.skinCondition as string}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {new Date(e.date as string).toLocaleDateString(
                      locale === 'en' ? 'en-GB' : 'ar-SA',
                    )}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-xs text-text-secondary"> {e.hydration as number}/10</span>
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
                  {t('skinDiary.delete')}
                </button>
              </Card>
            ))}
          </div>
        )}

        <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t('skinDiary.modal.title')}>
          <div className="space-y-3">
            <div>
              <label htmlFor="skd-image" className="text-sm font-semibold">
                {t('skinDiary.imageUrlLabel')}
              </label>
              <input
                id="skd-image"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              />
            </div>
            <div>
              <label htmlFor="skd-condition" className="text-sm font-semibold">
                {t('skinDiary.conditionLabel')}
              </label>
              <select
                id="skd-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as TranslationKey)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {t(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">
                {t('skinDiary.hydrationLabel', { hydration })}
              </label>
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
              <label htmlFor="skd-notes" className="text-sm font-semibold">
                {t('skinDiary.notesLabel')}
              </label>
              <textarea
                id="skd-notes"
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
                    skinCondition: t(condition),
                    hydration,
                    notes: notes || undefined,
                  });
              }}
              loading={addMut.isPending}
              className="w-full"
            >
              {t('skinDiary.save')}
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
