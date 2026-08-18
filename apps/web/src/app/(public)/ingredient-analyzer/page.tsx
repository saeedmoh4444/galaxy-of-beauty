'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const RATING_COLORS: Record<string, string> = {
  safe: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  caution: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  avoid: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};
const RATING_LABELS = {
  safe: 'marketing.ingredient-analyzer.rating-safe',
  caution: 'marketing.ingredient-analyzer.rating-caution',
  avoid: 'marketing.ingredient-analyzer.rating-avoid',
} as const;
type RatingLabelKey = (typeof RATING_LABELS)[keyof typeof RATING_LABELS];
const labelMap: Record<string, RatingLabelKey | undefined> = RATING_LABELS;

export default function IngredientAnalyzerPage(): JSX.Element {
  const { t } = useLocale();
  const [text, setText] = useState('');
  const [searchText, setSearchText] = useState('');

  const { data, isLoading, isError, refetch } = api.ingredientAnalyzer.analyze.useQuery(
    { ingredients: searchText },
    { enabled: searchText.length > 0 },
  ) as {
    data:
      { ingredients: Array<Record<string, unknown>>; stats: Record<string, number> } | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const ingredients = data?.ingredients ?? [];
  const stats = data?.stats;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold">{t('marketing.ingredient-analyzer.title')}</h1>
        <p className="mt-2 text-text-secondary">{t('marketing.ingredient-analyzer.subtitle')}</p>
      </div>

      <Card padding="lg" className="mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('marketing.ingredient-analyzer.textarea-placeholder')}
          rows={6}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        <div className="mt-3 flex gap-2">
          <Button
            onClick={() => setSearchText(text.trim())}
            loading={isLoading}
            disabled={!text.trim()}
            className="flex-1"
          >
            {t('marketing.ingredient-analyzer.analyze')}
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert
          message={t('marketing.ingredient-analyzer.load-error')}
          onRetry={() => refetch()}
        />
      ) : stats ? (
        <Card padding="lg">
          <div className="grid grid-cols-4 gap-4 mb-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.safe}</p>
              <p className="text-xs text-text-secondary">
                {t('marketing.ingredient-analyzer.safe-label')}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.caution}</p>
              <p className="text-xs text-text-secondary">
                {t('marketing.ingredient-analyzer.caution-label')}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.avoid}</p>
              <p className="text-xs text-text-secondary">
                {t('marketing.ingredient-analyzer.avoid-label')}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-600">{stats.score}%</p>
              <p className="text-xs text-text-secondary">
                {t('marketing.ingredient-analyzer.safety-label')}
              </p>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {ingredients.map((ing: Record<string, unknown>, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-surface-muted dark:bg-gray-800 px-3 py-2"
              >
                <span className="text-sm font-medium">{ing.name as string}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${RATING_COLORS[ing.rating as string] ?? RATING_COLORS['safe']}`}
                >
                  {t(labelMap[ing.rating as string] ?? RATING_LABELS.safe)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
