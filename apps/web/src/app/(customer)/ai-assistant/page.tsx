'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AIAssistantPage(): JSX.Element {
  const [q, setQ] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const { data: topics } = api.aiAssistant.topics.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const { data: answer, isLoading } = api.aiAssistant.ask.useQuery(
    { question: searchQ },
    { enabled: searchQ.length > 1 },
  ) as { data: Record<string, unknown> | undefined; isLoading: boolean };

  const topicList = (topics ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">🧠 مساعدة الذكاء الاصطناعي</h1>
          <p className="mt-1 text-sm text-text-secondary">اسأليني أي سؤال عن الجمال والعناية</p>
        </div>
        <Card padding="lg">
          <div className="flex gap-2 mb-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchQ(q.trim())}
              placeholder="اسألي عن روتين، بشرة، مكياج..."
              className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button onClick={() => setSearchQ(q.trim())}>اسألي</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {topicList.map((t: Record<string, unknown>) => (
              <button
                key={t.key as string}
                onClick={() => {
                  setQ(t.label as string);
                  setSearchQ(t.label as string);
                }}
                className="rounded-full bg-brand-50 dark:bg-brand-950 px-3 py-1.5 text-xs font-medium"
              >
                {t.emoji as string} {t.label as string}
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
              <span className="text-3xl">🤖</span>
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
