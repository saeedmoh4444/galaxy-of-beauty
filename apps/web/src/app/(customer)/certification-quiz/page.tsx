'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CertificationQuizPage(): JSX.Element {
  const { data: quizzes, isLoading } = api.certificationQuiz.quizzes.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const { data: certs } = api.certificationQuiz.myCertificates.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const [quizId, setQuizId] = useState<string | null>(null);
  const { data: quiz } = api.certificationQuiz.get.useQuery(
    { id: quizId ?? '' },
    { enabled: !!quizId },
  ) as { data: Record<string, unknown> | undefined };
  const submitMut = api.certificationQuiz.submit.useMutation();
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const qs = (quizzes ?? []) as Array<Record<string, unknown>>;
  const questions = (quiz?.questions ?? []) as Array<Record<string, unknown>>;
  const myCerts = (certs ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> اختبارات الشهادات</h1>
          <p className="mt-1 text-sm text-text-secondary">
            اختاري معلوماتكِ في التجميل واحصلي على شهادة
          </p>
        </div>

        {result ? (
          <Card padding="lg" className="text-center border-2 border-green-300">
            <span className="text-6xl">{(result.passed as boolean) ? '' : ''}</span>
            <h2 className="mt-4 text-xl font-bold">
              {(result.passed as boolean) ? 'مبروك! اجتزتِ الاختبار ' : 'حاولي مرة أخرى!'}
            </h2>
            <p className="text-2xl font-extrabold text-brand-600 mt-2">{result.score as number}%</p>
            {(result.certificate as Record<string, unknown>) ? (
              <div className="mt-4 rounded-xl bg-green-50 dark:bg-green-950 p-4">
                <p className="font-bold">
                  شهادة: {(result.certificate as Record<string, unknown>).quizName as string}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {new Date(
                    (result.certificate as Record<string, unknown>).date as string,
                  ).toLocaleDateString('ar-SA')}
                </p>
              </div>
            ) : null}
            <Button
              className="mt-4"
              onClick={() => {
                setQuizId(null);
                setAnswers([]);
                setResult(null);
              }}
            >
               اختبار آخر
            </Button>
          </Card>
        ) : quizId ? (
          <Card padding="lg">
            <h3 className="font-bold text-lg mb-4">{quiz?.nameAr as string}</h3>
            <div className="space-y-4">
              {questions.map((q: Record<string, unknown>, qi: number) => (
                <div key={qi}>
                  <p className="font-semibold text-sm mb-2">{q.q as string}</p>
                  <div className="space-y-1">
                    {(q.opts as string[]).map((opt: string, oi: number) => (
                      <button
                        key={oi}
                        onClick={() => {
                          const a = [...answers];
                          a[qi] = oi;
                          setAnswers(a);
                        }}
                        className={`w-full text-right rounded-lg border p-3 text-sm transition-all ${answers[qi] === oi ? 'border-brand-400 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() =>
                submitMut.mutate(
                  { quizId, answers },
                  { onSuccess: (d) => setResult(d as Record<string, unknown>) },
                )
              }
              loading={submitMut.isPending}
              className="w-full mt-4"
            >
              تقديم 
            </Button>
          </Card>
        ) : isLoading ? (
          <CardSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {qs.map((q: Record<string, unknown>) => (
              <button key={q.id as string} onClick={() => setQuizId(q.id as string)}>
                <Card padding="lg" className="text-center hover:shadow-lg transition-all">
                  <span className="text-4xl">{q.emoji as string}</span>
                  <h3 className="mt-2 font-bold">{q.nameAr as string}</h3>
                  <p className="text-xs text-text-secondary">{q.questionCount as number} أسئلة</p>
                </Card>
              </button>
            ))}
          </div>
        )}

        {myCerts.length > 0 && (
          <Card padding="lg">
            <h3 className="font-bold mb-3"> شهاداتي</h3>
            <div className="space-y-2">
              {myCerts.map((c: Record<string, unknown>) => (
                <div
                  key={c.id as number}
                  className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-950 p-3"
                >
                  <div>
                    <p className="font-bold text-sm">{c.quizName as string}</p>
                    <p className="text-xs text-text-secondary">
                      {new Date(c.date as string).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <span className="font-bold text-green-700">{c.score as number}%</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
