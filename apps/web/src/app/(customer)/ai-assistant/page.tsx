'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function AIAssistantPage(): JSX.Element {
  const { t } = useLocale();
  const [q, setQ] = useState('');
  const { data: topics } = api.aiAssistant.topics.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const askMut = api.aiAssistant.ask.useMutation();

  const answer = askMut.data as Record<string, unknown> | undefined;
  const isLoading = askMut.isPending;

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length > 1) askMut.mutate({ question: trimmed });
  };

  const topicList = (topics ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('aiAssistant.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('aiAssistant.subtitle')}</p>
        </div>
        <Card padding="lg">
          <div className="flex gap-2 mb-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask(q)}
              placeholder={t('aiAssistant.placeholder')}
              className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button onClick={() => ask(q)}>{t('aiAssistant.ask')}</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {topicList.map((tx: Record<string, unknown>) => (
              <button
                key={tx.key as string}
                onClick={() => {
                  setQ(tx.label as string);
                  ask(tx.label as string);
                }}
                className="rounded-full bg-brand-50 dark:bg-brand-950 px-3 py-1.5 text-xs font-medium"
              >
                {tx.emoji as string} {tx.label as string}
              </button>
            ))}
          </div>
        </Card>
        {isLoading ? (
          <CardSkeleton />
        ) : (answer as Record<string, unknown>) ? (
          <Card
            padding="lg"
            className="border-2 border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl"></span>
              <div>
                <p className="font-bold text-sm mb-2">
                  {(answer as Record<string, unknown>).question as string}
                </p>
                <p className="text-sm leading-relaxed">
                  {(answer as Record<string, unknown>).answer as string}
                </p>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
