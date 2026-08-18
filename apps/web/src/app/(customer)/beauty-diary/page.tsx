'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const MOODS: { value: number; emoji: string; label: TranslationKey }[] = [
  { value: 5, emoji: '', label: 'beautyDiary.mood.great' },
  { value: 4, emoji: '', label: 'beautyDiary.mood.good' },
  { value: 3, emoji: '', label: 'beautyDiary.mood.ok' },
  { value: 2, emoji: '', label: 'beautyDiary.mood.bad' },
  { value: 1, emoji: '', label: 'beautyDiary.mood.irritated' },
];

export default function BeautyDiaryPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: journals, isLoading } = api.beautyJournal.list.useQuery({ page: 1, limit: 20 }) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const createMut = api.beautyJournal.create.useMutation();
  const entries =
    (Array.isArray(journals)
      ? journals
      : ((journals as Record<string, unknown>)?.items as Array<Record<string, unknown>>)) ?? [];
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!content.trim()) return;
    createMut.mutate(
      { content: content.trim(), mood },
      {
        onSuccess: () => {
          setContent('');
          setMood(3);
          setShowForm(false);
        },
      },
    );
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('beautyDiary.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('beautyDiary.subtitle')}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? '' : t('beautyDiary.addEntry')}
          </Button>
        </div>

        {showForm && (
          <Card padding="lg">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('beautyDiary.placeholder')}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <div className="flex gap-2 mt-3 justify-center">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`rounded-full px-3 py-2 text-center transition-all ${mood === m.value ? 'ring-2 ring-brand-400 bg-brand-50 scale-110' : ''}`}
                >
                  <span className="text-2xl block">{m.emoji}</span>
                  <span className="text-xs">{t(m.label)}</span>
                </button>
              ))}
            </div>
            <Button onClick={handleCreate} loading={createMut.isPending} className="w-full mt-3">
              {t('beautyDiary.save')}
            </Button>
          </Card>
        )}

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : entries.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('beautyDiary.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((e: Record<string, unknown>) => {
              const moodEmoji = MOODS.find((m) => m.value === (e.mood as number))?.emoji ?? '';
              return (
                <Card key={e.id as number} padding="md">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{moodEmoji}</span>
                    <div className="flex-1">
                      <p className="text-sm">{e.content as string}</p>
                      <p className="text-xs text-text-tertiary mt-1">
                        {new Date(e.createdAt as string).toLocaleDateString(
                          locale === 'en' ? 'en-GB' : 'ar-SA',
                          {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
