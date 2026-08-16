'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, Button } from '@galaxy/ui';

const RATING_COLORS: Record<string, string> = {
  safe: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  caution: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  avoid: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};
const RATING_LABELS: Record<string, string> = {
  safe: ' آمن',
  caution: ' حذر',
  avoid: ' تجنب',
};

export default function IngredientAnalyzerPage(): JSX.Element {
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
        <h1 className="mt-4 text-3xl font-bold">تحليل المكونات</h1>
        <p className="mt-2 text-text-secondary">الصقي قائمة المكونات لتحليل فوري للسلامة</p>
      </div>

      <Card padding="lg" className="mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="الصقي قائمة المكونات هنا... (مفصولة بفواصل أو أسطر)"
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
            تحليل
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message="فشل التحليل" onRetry={() => refetch()} />
      ) : stats ? (
        <Card padding="lg">
          <div className="grid grid-cols-4 gap-4 mb-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.safe}</p>
              <p className="text-xs text-text-secondary">آمن</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.caution}</p>
              <p className="text-xs text-text-secondary">حذر</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.avoid}</p>
              <p className="text-xs text-text-secondary">تجنب</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-600">{stats.score}%</p>
              <p className="text-xs text-text-secondary">الأمان</p>
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
                  {RATING_LABELS[ing.rating as string] ?? RATING_LABELS['safe']}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
