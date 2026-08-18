'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function SkinAnalysisPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [imageUrl, setImageUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const {
    data: history,
    isLoading,
    isError,
    refetch,
  } = api.skinAnalysis.history.useQuery({ page: 1, limit: 10 });
  const analyzeMutation = api.skinAnalysis.analyze.useMutation({
    onSuccess: (data) => {
      setResult(((data as Record<string, unknown>).resultJson as Record<string, unknown>) || null);
      setAnalyzing(false);
      refetch();
    },
    onError: () => setAnalyzing(false),
  });

  const histItems =
    ((history as unknown as Record<string, unknown>)?.items as Array<Record<string, unknown>>) ||
    [];
  const totalAnalyses =
    ((history as unknown as Record<string, unknown>)?.total as number) || histItems.length;

  // Trend stats from history
  const skinTypes = histItems
    .map((a) => (a.resultJson as Record<string, unknown>)?.skinType as string)
    .filter(Boolean);
  const latestSkinType = skinTypes[0] ?? t('skin.unspecified');
  const allConcerns = histItems
    .flatMap((a) => ((a.resultJson as Record<string, unknown>)?.concerns as string[]) ?? [])
    .filter(Boolean);
  const topConcerns = [...new Set(allConcerns)].slice(0, 5);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
            {t('skin.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{t('skin.subtitle')}</p>
        </div>

        {/* Stats Dashboard */}
        {histItems.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-4">
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="mt-1 text-2xl font-bold">{totalAnalyses}</p>
              <p className="text-xs text-text-secondary">{t('skin.stat.analyses')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="mt-1 text-lg font-bold">{latestSkinType}</p>
              <p className="text-xs text-text-secondary">{t('skin.stat.currentType')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="mt-1 text-2xl font-bold">{topConcerns.length}</p>
              <p className="text-xs text-text-secondary">{t('skin.stat.concerns')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="mt-1 text-2xl font-bold">
                {skinTypes.length > 1 ? t('skin.stat.changing') : t('skin.stat.stable')}
              </p>
              <p className="text-xs text-text-secondary">{t('skin.stat.trend')}</p>
            </Card>
          </div>
        )}

        {/* Upload */}
        <Card padding="md">
          <h3 className="mb-3 font-semibold">{t('skin.uploadTitle')}</h3>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
            />
            <p className="text-xs text-text-tertiary">{t('skin.orImageUrl')}</p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <Button
                onClick={() => {
                  if (!imageUrl) return;
                  setAnalyzing(true);
                  setResult(null);
                  analyzeMutation.mutate({ imageUrl });
                }}
                loading={analyzing}
                disabled={!imageUrl}
              >
                {t('skin.analyze')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Result */}
        {result && (
          <Card
            padding="lg"
            className="border-2 border-brand-300 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-950/50"
          >
            <h3 className="mb-4 font-bold text-brand-700 dark:text-brand-300 text-lg">
              {t('skin.resultsTitle')}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white dark:bg-gray-800 p-4">
                <p className="text-xs text-text-secondary">{t('skin.result.skinType')}</p>
                <p className="text-xl font-bold text-brand-600">
                  {(result['skinType'] as string) || t('skin.unspecified')}
                </p>
              </div>
              <div className="rounded-xl bg-white dark:bg-gray-800 p-4">
                <p className="text-xs text-text-secondary">{t('skin.result.hydration')}</p>
                <p className="text-xl font-bold text-blue-600">
                  {(result['hydrationLevel'] as string) || '—'}
                </p>
              </div>
              <div className="rounded-xl bg-white dark:bg-gray-800 p-4">
                <p className="text-xs text-text-secondary">{t('skin.result.sensitivity')}</p>
                <p className="text-xl font-bold text-purple-600">
                  {(result['sensitivityLevel'] as string) || '—'}
                </p>
              </div>
              <div className="rounded-xl bg-white dark:bg-gray-800 p-4">
                <p className="text-xs text-text-secondary">{t('skin.result.age')}</p>
                <p className="text-xl font-bold text-amber-600">
                  {(result['ageEstimate'] as string) || '—'}
                </p>
              </div>
            </div>
            {(result['concerns'] as unknown[]) && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">{t('skin.concernsTitle')}</p>
                <div className="flex flex-wrap gap-2">
                  {(result['concerns'] as string[])?.map((c: string) => (
                    <span
                      key={c}
                      className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700 dark:bg-red-900 dark:text-red-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(result['recommendations'] as Record<string, unknown>) && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold">{t('skin.recsTitle')}</p>
                {['services', 'products', 'routine'].map((cat) => {
                  const recs = (result['recommendations'] as Record<string, unknown>)?.[
                    cat
                  ] as string[];
                  if (!recs?.length) return null;
                  return (
                    <div key={cat} className="rounded-xl bg-white dark:bg-gray-800 p-3">
                      <p className="text-xs font-bold text-text-secondary mb-1">
                        {cat === 'services'
                          ? t('skin.recs.services')
                          : cat === 'products'
                            ? t('skin.recs.products')
                            : t('skin.recs.routine')}
                      </p>
                      <ul className="list-disc list-inside text-sm text-text-primary dark:text-gray-300 space-y-0.5">
                        {recs.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* History Timeline */}
        <h3 className="text-lg font-bold">{t('skin.historyTitle')}</h3>
        {isLoading ? (
          <CardListSkeleton count={3} />
        ) : isError ? (
          <ErrorAlert message={t('skin.err.load')} onRetry={() => refetch()} />
        ) : histItems.length === 0 ? (
          <EmptyState title={t('skin.empty.title')} description={t('skin.empty.desc')} />
        ) : (
          <div className="space-y-3">
            {histItems.map((a, idx) => {
              const res = a.resultJson as Record<string, unknown>;
              return (
                <Card
                  key={a.id as number}
                  padding="md"
                  className={`flex items-center gap-4 ${idx === 0 ? 'border-l-4 border-brand-500' : ''}`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900 dark:to-purple-900 text-lg"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">
                        {(res?.skinType as string) || t('skin.analysisFallback')}
                      </p>
                      {idx === 0 && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                          {t('skin.latest')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(res?.concerns as string[])?.slice(0, 3).map((c: string) => (
                        <span
                          key={c}
                          className="text-[10px] text-text-secondary bg-surface-muted dark:bg-gray-800 rounded px-1.5 py-0.5"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      {new Date(a.createdAt as string).toLocaleDateString(
                        locale === 'en' ? 'en-GB' : 'ar-SA',
                        {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </p>
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
