'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const MOODS = ['', '', '', '', ''];
const SERVICE_TYPES = ['hair', 'skin', 'makeup', 'nails', 'body'] as const;
const TYPE_LABELS: Record<string, TranslationKey> = {
  hair: 'beautyJournal.type.hair',
  skin: 'beautyJournal.type.skin',
  makeup: 'beautyJournal.type.makeup',
  nails: 'beautyJournal.type.nails',
  body: 'beautyJournal.type.body',
};

export default function BeautyJournalPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = api.beautyJournal.list.useQuery({
    page: 1,
    limit: 20,
  });
  const createMut = api.beautyJournal.create.useMutation({
    onSuccess: () => {
      refetch();
      setContent('');
      setTitle('');
      setMood(0);
      setServiceType('');
      addToast('success', t('beautyJournal.toastAdded'));
    },
  });
  const deleteMut = api.beautyJournal.delete.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', t('beautyJournal.toastDeleted'));
    },
  });
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState(0);
  const [serviceType, setServiceType] = useState('');

  const entries = data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('beautyJournal.title')}
        </h1>
        <p className="text-sm text-text-secondary">{t('beautyJournal.subtitle')}</p>

        {/* New Entry */}
        <Card padding="lg">
          <div className="space-y-3">
            <input
              placeholder={t('beautyJournal.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
            <textarea
              placeholder={t('beautyDiary.placeholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
            <div className="flex gap-4 flex-wrap">
              <div className="flex gap-1">
                {MOODS.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setMood(i + 1)}
                    className={`text-xl transition-all ${mood === i + 1 ? 'scale-125' : 'opacity-40 hover:opacity-70'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-600 dark:bg-gray-800"
              >
                <option value="">{t('beautyJournal.serviceTypeLabel')}</option>
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {t(TYPE_LABELS[s])}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => {
                if (content.trim())
                  createMut.mutate({
                    title: title || undefined,
                    content: content.trim(),
                    mood: mood || undefined,
                    serviceType: (serviceType || undefined) as
                      (typeof SERVICE_TYPES)[number] | undefined,
                  });
              }}
              className="w-full"
              size="sm"
            >
              {t('beautyJournal.submit')}
            </Button>
          </div>
        </Card>

        {/* Entries */}
        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : isError ? (
          <ErrorAlert message={t('beautyJournal.loadError')} onRetry={() => refetch()} />
        ) : entries.length === 0 ? (
          <EmptyState
            title={t('beautyJournal.emptyTitle')}
            description={t('beautyJournal.emptyDesc')}
          />
        ) : (
          <div className="space-y-4">
            {entries.map((e) => (
              <Card key={e.id} padding="md" className="relative group">
                <button
                  onClick={() => deleteMut.mutate({ id: e.id })}
                  className="absolute top-2 right-2 hidden rounded-full bg-red-500 p-1 text-white text-xs group-hover:block"
                ></button>
                <div className="flex items-center gap-3 text-xs text-text-tertiary mb-2">
                  {e.mood && <span>{MOODS[e.mood - 1]}</span>}
                  {e.serviceType && (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-600">
                      {t(TYPE_LABELS[e.serviceType])}
                    </span>
                  )}
                  <span>
                    {new Date(e.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {e.title && (
                  <h3 className="font-semibold text-text-primary dark:text-gray-100 mb-1">
                    {e.title}
                  </h3>
                )}
                <p className="text-sm text-text-secondary dark:text-gray-400 whitespace-pre-wrap">
                  {e.content}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
