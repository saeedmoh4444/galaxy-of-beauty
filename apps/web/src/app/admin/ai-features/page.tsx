'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminAiFeaturesPage(): JSX.Element {
  const { t } = useLocale();
  const [reviewId, setReviewId] = useState('');
  const analyzeMut = api.aiFeatures.analyzeSentiment.useMutation();
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const descMut = api.aiFeatures.generateDescription.useMutation();
  const [svcAr, setSvcAr] = useState('');
  const [svcEn, setSvcEn] = useState('');
  const [desc, setDesc] = useState<Record<string, unknown> | null>(null);

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.ai-features.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.ai-features.subtitle')}</p>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('admin.ai-features.sentiment-title')}</h3>
          <div className="flex gap-3">
            <input
              value={reviewId}
              onChange={(e) => setReviewId(e.target.value)}
              placeholder={t('admin.ai-features.review-id-placeholder')}
              className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={() =>
                analyzeMut.mutate(
                  { reviewId: Number(reviewId) },
                  { onSuccess: (r) => setResult(r as Record<string, unknown>) },
                )
              }
              loading={analyzeMut.isPending}
            >
              {t('admin.ai-features.analyze')}
            </Button>
          </div>
          {result && (
            <div className="mt-3 rounded-lg border p-3 flex items-center gap-3">
              <span className="text-3xl">
                {result.sentiment === 'positive' ? '' : result.sentiment === 'negative' ? '' : ''}
              </span>
              <div>
                <p className="font-bold">{result.sentiment as string}</p>
                <p className="text-xs text-text-secondary">Score: {result.score as number}</p>
              </div>
            </div>
          )}
        </Card>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('admin.ai-features.generate-title')}</h3>
          <div className="space-y-3">
            <input
              value={svcAr}
              onChange={(e) => setSvcAr(e.target.value)}
              placeholder={t('admin.ai-features.service-name-ar')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              value={svcEn}
              onChange={(e) => setSvcEn(e.target.value)}
              placeholder={t('admin.ai-features.service-name-en')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={() =>
                descMut.mutate(
                  { serviceNameAr: svcAr, serviceNameEn: svcEn },
                  { onSuccess: (r) => setDesc(r as Record<string, unknown>) },
                )
              }
              loading={descMut.isPending}
              className="w-full"
            >
              {t('admin.ai-features.generate')}
            </Button>
          </div>
          {desc && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-text-secondary mb-1">{t('admin.ai-features.arabic')}</p>
                <p className="text-sm">{desc.descriptionAr as string}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-text-secondary mb-1">English</p>
                <p className="text-sm">{desc.descriptionEn as string}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
