'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function BeforeAfterPage(): JSX.Element {
  const { t } = useLocale();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = api.beforeAfter.feed.useQuery({
    page: 1,
    limit: 12,
  }) as {
    data: { items: Array<Record<string, unknown>>; total: number } | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const submitMut = api.beforeAfter.submit.useMutation({
    onSuccess: () => {
      setShowSubmit(false);
      refetch();
    },
  });

  const [showSubmit, setShowSubmit] = useState(false);
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [serviceType, setServiceType] = useState('makeup');
  const [techName, setTechName] = useState('');
  const [desc, setDesc] = useState('');

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold">{t('marketing.before-after.title')}</h1>
        <p className="mt-2 text-text-secondary">{t('marketing.before-after.subtitle')}</p>
      </div>

      {user && (
        <div className="text-center mb-6">
          <Button onClick={() => setShowSubmit(true)}>
            {t('marketing.before-after.share-cta')}
          </Button>
        </div>
      )}

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : isError ? (
        <ErrorAlert message={t('marketing.before-after.load-error')} onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title={t('marketing.before-after.empty-title')}
          description={t('marketing.before-after.empty-desc')}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((ba: Record<string, unknown>) => (
            <Card key={ba.id as number} padding="md" className="group">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-text-tertiary mb-1 text-center">
                    {t('marketing.before-after.before-label')}
                  </p>
                  <div className="h-32 rounded-xl bg-surface-muted dark:bg-gray-800 flex items-center justify-center text-3xl"></div>
                </div>
                <div>
                  <p className="text-[10px] text-text-tertiary mb-1 text-center">
                    {t('marketing.before-after.after-label')}
                  </p>
                  <div className="h-32 rounded-xl bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900 dark:to-purple-900 flex items-center justify-center text-3xl"></div>
                </div>
              </div>
              <div className="mt-3">
                <p className="font-bold text-sm">{ba.description as string}</p>
                <p className="text-xs text-text-secondary mt-1">
                  ‍ {ba.technicianName as string} · {ba.serviceType as string}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-text-tertiary">{ba.userName as string}</span>
                <span className="text-xs text-red-500">️ {ba.likes as number}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        title={t('marketing.before-after.modal-title')}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ba-before" className="text-sm font-semibold">
                {t('marketing.before-after.before-url-label')}
              </label>
              <input
                id="ba-before"
                type="url"
                value={before}
                onChange={(e) => setBefore(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              />
            </div>
            <div>
              <label htmlFor="ba-after" className="text-sm font-semibold">
                {t('marketing.before-after.after-url-label')}
              </label>
              <input
                id="ba-after"
                type="url"
                value={after}
                onChange={(e) => setAfter(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ba-service-type" className="text-sm font-semibold">
                {t('marketing.before-after.service-type-label')}
              </label>
              <select
                id="ba-service-type"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              >
                {['makeup', 'skincare', 'hair', 'nails', 'massage'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ba-tech-name" className="text-sm font-semibold">
                {t('marketing.before-after.tech-name-label')}
              </label>
              <input
                id="ba-tech-name"
                type="text"
                value={techName}
                onChange={(e) => setTechName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              />
            </div>
          </div>
          <div>
            <label htmlFor="ba-desc" className="text-sm font-semibold">
              {t('marketing.before-after.desc-label')}
            </label>
            <textarea
              id="ba-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              maxLength={300}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              rows={2}
            />
          </div>
          <Button
            onClick={() => {
              if (before && after && techName)
                submitMut.mutate({
                  beforeUrl: before,
                  afterUrl: after,
                  serviceType,
                  technicianName: techName,
                  description: desc,
                });
            }}
            loading={submitMut.isPending}
            className="w-full"
          >
            {t('marketing.before-after.submit')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
