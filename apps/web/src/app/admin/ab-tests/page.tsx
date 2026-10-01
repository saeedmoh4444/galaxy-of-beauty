'use client';

import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, ErrorAlert } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminAbTestsPage(): JSX.Element {
  const { t } = useLocale();
  const testsQ = api.abTest.list.useQuery();
  const declareMut = api.abTest.declareWinner.useMutation();

  if (testsQ.isLoading) return <CardListSkeleton count={3} />;
  if (testsQ.isError) {
    return <ErrorAlert message={t('common.loadFailed')} onRetry={() => testsQ.refetch()} />;
  }

  const tests = (testsQ.data as Array<Record<string, unknown>> | undefined) ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.ab-tests.title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('admin.ab-tests.subtitle')}</p>
      </div>
      {tests.length === 0 ? (
        <Card padding="lg" className="text-center text-text-secondary">
          {t('admin.ab-tests.empty')}
        </Card>
      ) : (
        tests.map((test) => {
          const testKey = test.testKey as string;
          return (
            <AbTestCard
              key={testKey}
              testKey={testKey}
              variantA={test.variantA as string | null}
              variantB={test.variantB as string | null}
              winner={test.winner as string | null}
              closed={test.closed as boolean}
              onDeclare={(winner) => declareMut.mutate({ testKey, winner })}
            />
          );
        })
      )}
    </div>
  );
}

function AbTestCard({
  testKey,
  variantA,
  variantB,
  winner,
  closed,
  onDeclare,
}: {
  testKey: string;
  variantA: string | null;
  variantB: string | null;
  winner: string | null;
  closed: boolean;
  onDeclare: (winner: 'A' | 'B') => void;
}): JSX.Element {
  const { t } = useLocale();
  const resultsQ = api.abTest.results.useQuery({ testKey });

  if (resultsQ.isLoading) return <CardListSkeleton count={1} />;

  const data = resultsQ.data as
    | {
        variants: Array<{
          variant: string;
          impressions: number;
          conversions: number;
          conversionRate: number;
        }>;
        significance: {
          pValue: number;
          significant: boolean;
          winnerHint: 'A' | 'B' | null;
        } | null;
      }
    | undefined;

  const variants = data?.variants ?? [];
  const significance = data?.significance ?? null;

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{testKey}</h2>
        {closed && winner ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
            {t('admin.ab-tests.winner', { variant: winner })}
          </span>
        ) : (
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs">
            {t('admin.ab-tests.running')}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {variants.map((v) => (
          <div key={v.variant} className="rounded-xl bg-surface-muted p-4">
            <p className="font-bold">
              {t('admin.ab-tests.variant', { variant: v.variant })}:{' '}
              {v.variant === 'A' ? (variantA ?? 'A') : (variantB ?? 'B')}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {t('admin.ab-tests.impressions', { count: String(v.impressions) })} ·{' '}
              {t('admin.ab-tests.conversions', { count: String(v.conversions) })}
            </p>
            <p className="mt-1 text-xl font-extrabold text-brand-600">{v.conversionRate}%</p>
          </div>
        ))}
      </div>

      {significance ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              significance.significant
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
            }`}
          >
            {t('admin.ab-tests.p-value', { value: significance.pValue.toFixed(4) })}
          </span>
          {significance.significant && (
            <span className="text-sm text-text-secondary">
              {t('admin.ab-tests.significant-hint', { variant: significance.winnerHint ?? '?' })}
            </span>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-text-tertiary">{t('admin.ab-tests.insufficient-data')}</p>
      )}

      {!closed && (
        <div className="mt-4 flex gap-3">
          <Button
            size="sm"
            disabled={!significance?.significant || !significance.winnerHint}
            onClick={() => onDeclare(significance!.winnerHint!)}
          >
            {t('admin.ab-tests.declare-winner')}
          </Button>
        </div>
      )}
    </Card>
  );
}
