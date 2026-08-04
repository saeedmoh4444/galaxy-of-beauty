'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/ui';
import Link from 'next/link';

export default function ServiceRecommenderPage(): JSX.Element {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [searchAnswers, setSearchAnswers] = useState<Record<string, string> | null>(null);
  const { data: questions } = api.serviceRecommender.questions.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data: results, isLoading } = api.serviceRecommender.recommend.useQuery({ answers: searchAnswers ?? {} }, { enabled: !!searchAnswers }) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };

  const qs = (questions ?? []) as Array<Record<string,unknown>>;
  const currentQ = qs[step];

  const handleAnswer = (key: string) => {
    const updated = { ...answers, [currentQ?.id as string]: key };
    setAnswers(updated);
    if (step < qs.length - 1) setStep(step + 1);
    else setSearchAnswers(updated);
  };

  const recs = results ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">🤖</span><h1 className="mt-4 text-3xl font-bold">اكتشفي خدماتكِ المثالية</h1><p className="mt-2 text-text-secondary">أجيبي على ٣ أسئلة وسنقترح عليكِ أفضل خدمات الجمال المناسبة لكِ</p></div>

      {searchAnswers ? (
        isLoading ? <div className="space-y-3">{Array.from({length:4},(_,i)=><CardSkeleton key={i}/>)}</div> :
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">{recs.map((r: Record<string,unknown>) => (
            <Link key={r.key as string} href={`/womens-services?category=${r.key}`}>
              <Card padding="lg" className="hover:shadow-lg transition-all text-center">
                <span className="text-4xl">{r.emoji as string}</span><h3 className="font-bold mt-2">{r.nameAr as string}</h3>
                <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-2 rounded-full bg-brand-500" style={{ width: `${r.matchPct as number}%` }} /></div>
                <span className="text-xs font-bold text-brand-600 mt-1">{r.matchPct as number}% تطابق</span>
              </Card>
            </Link>
          ))}</div>
          <div className="text-center"><Button variant="ghost" onClick={() => { setStep(0); setAnswers({}); setSearchAnswers(null); }}>🔄 إعادة</Button></div>
        </div>
      ) : currentQ ? (
        <Card padding="lg">
          <div className="flex gap-1 mb-6">{qs.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`} />)}</div>
          <p className="text-xs text-text-tertiary mb-1">السؤال {step + 1} من {qs.length}</p>
          <h2 className="text-xl font-bold mb-6">{currentQ.q as string}</h2>
          <div className="space-y-2">{(currentQ.opts as Array<Record<string,unknown>>).map((o: Record<string,unknown>) => (
            <button key={o.k as string} onClick={() => handleAnswer(o.k as string)} className="w-full rounded-xl border-2 border-edge dark:border-gray-700 p-4 text-right hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all">{o.l as string}</button>
          ))}</div>
        </Card>
      ) : null}
    </div>
  );
}
