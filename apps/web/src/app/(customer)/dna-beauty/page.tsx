'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DNABeautyPage(): JSX.Element {
  const { data: questions } = api.dnaBeauty.questions.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [searchAnswers, setSearchAnswers] = useState<Record<string, boolean> | null>(null);
  const {
    data: result,
    isLoading,
    isError,
    refetch,
  } = api.dnaBeauty.analyze.useQuery(
    { answers: searchAnswers ?? {} },
    { enabled: !!searchAnswers },
  ) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const qs = (questions ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> تحليل الجينات</h1>
          <p className="mt-1 text-sm text-text-secondary">
            اكتشفي احتياجات بشرتكِ بناءً على سماتكِ الوراثية
          </p>
        </div>
        {result ? (
          <Card padding="lg" className="text-center border-2 border-purple-300">
            <span className="text-6xl"></span>
            <h2 className="mt-4 text-xl font-bold">نتيجة التحليل</h2>
            <p className="text-2xl font-extrabold text-brand-600 mt-2">
              {result.score as number}% تطابق
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {(result.traits as Array<Record<string, unknown>>)?.map(
                (t: Record<string, unknown>) => (
                  <span
                    key={t.key as string}
                    className="rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-0.5 text-xs"
                  >
                    {t.label as string}
                  </span>
                ),
              )}
            </div>
            <div className="mt-4 text-right space-y-2">
              <p className="font-bold"> موصى به:</p>
              <div className="flex flex-wrap gap-1">
                {(result.recommendations as string[])?.map((r: string) => (
                  <span
                    key={r}
                    className="rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs"
                  >
                    {r}
                  </span>
                ))}
              </div>
              <p className="font-bold mt-3"> تجنبي:</p>
              <div className="flex flex-wrap gap-1">
                {(result.avoid as string[])?.map((a: string) => (
                  <span
                    key={a}
                    className="rounded-full bg-red-100 dark:bg-red-900 px-2 py-0.5 text-xs"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setAnswers({});
                setSearchAnswers(null);
              }}
            >
               إعادة
            </Button>
          </Card>
        ) : isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل التحليل" onRetry={() => refetch()} />
        ) : (
          <Card padding="lg">
            <h3 className="font-bold mb-4"> أكملي الاستبيان</h3>
            <div className="space-y-3">
              {qs.map((q: Record<string, unknown>) => (
                <div
                  key={q.id as string}
                  className="flex items-center justify-between rounded-lg bg-surface-muted dark:bg-gray-800 p-3"
                >
                  <span className="text-sm">{q.q as string}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAnswers({ ...answers, [q.id as string]: true })}
                      className={`rounded-lg px-4 py-1.5 text-sm ${answers[q.id as string] === true ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      نعم
                    </button>
                    <button
                      onClick={() => setAnswers({ ...answers, [q.id as string]: false })}
                      className={`rounded-lg px-4 py-1.5 text-sm ${answers[q.id as string] === false ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      لا
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setSearchAnswers(answers)} className="w-full mt-4">
               تحليل
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
