'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function GiftQuizPage(): JSX.Element {
  const { data: questions, isLoading } = api.giftQuiz.questions.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [step, setStep] = useState(0);
  const [resultIds, setResultIds] = useState<number[]>([]);
  const { data: results, isLoading: resLoading } = api.giftQuiz.recommend.useQuery(
    { answers },
    { enabled: Object.keys(answers).length === (questions??[]).length },
  ) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };

  const qs = questions ?? [];
  const currentQ = qs[step];

  const handleAnswer = (qId: string, optKey: string) => {
    const newAnswers = { ...answers, [qId]: optKey };
    setAnswers(newAnswers);
    if (step < qs.length - 1) setStep(step + 1);
  };

  const reset = () => { setStep(0); setAnswers({}); setResultIds([]); };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div><h1 className="text-2xl font-bold">🎁 مستشار الهدايا</h1><p className="mt-1 text-sm text-gray-500">اكتشفي الهدية المثالية لمن تحبين</p></div>

        {isLoading ? <CardSkeleton/> : Object.keys(answers).length === qs.length && results ? (
          <>
            <Card padding="lg" className="text-center border-2 border-green-200 bg-green-50"><p className="text-3xl">🎁</p><p className="font-bold text-green-700 mt-2">اخترنا لكِ هذه الهدايا</p></Card>
            {resLoading ? <CardSkeleton/> : <div className="grid gap-3 sm:grid-cols-2">{(results??[]).map((r: Record<string,unknown>) => (
              <Card key={r.id as number} padding="lg" className="text-center">
                <span className="text-4xl">{r.emoji as string}</span>
                <h3 className="font-bold mt-2">{r.nameAr as string}</h3>
                <p className="text-xs text-gray-500 mt-1">{r.descAr as string}</p>
                <p className="text-xl font-extrabold text-brand-600 mt-2">{formatCurrency(r.price as number)}</p>
                <div className="mt-1 h-2 bg-gray-100 rounded-full"><div className="h-2 bg-brand-600 rounded-full" style={{width:`${r.score as number}%`}}/></div>
                <p className="text-xs text-gray-400 mt-1">ملاءمة {r.score as number}%</p>
              </Card>
            ))}</div>}
            <Button onClick={reset} variant="outline" className="w-full">🔄 إعادة الاختبار</Button>
          </>
        ) : currentQ ? (
          <Card padding="lg">
            <div className="mb-4"><div className="flex gap-1 mb-2">{qs.map((_: unknown, i: number) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i<=step?'bg-brand-600':'bg-gray-200'}`}/>)}</div><p className="text-xs text-gray-400">{step+1}/{qs.length}</p></div>
            <h2 className="text-xl font-bold mb-4">{currentQ.questionAr as string}</h2>
            <div className="space-y-2">{(currentQ.options as Array<Record<string,unknown>>).map((o: Record<string,unknown>) => (
              <button key={o.key as string} onClick={() => handleAnswer(currentQ.id as string, o.key as string)} className="w-full rounded-xl border-2 border-gray-200 p-4 text-right hover:border-brand-400 hover:bg-brand-50 transition-all">
                <span className="font-medium">{o.labelAr as string}</span>
              </button>
            ))}</div>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
