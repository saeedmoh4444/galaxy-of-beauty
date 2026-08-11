'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/ui';
import Link from 'next/link';

interface Question {
  id: string;
  questionAr: string;
  options: Array<{ key: string; labelAr: string; tags: string[] }>;
}
interface Rec {
  id: number;
  nameAr: string;
  descAr: string;
  price: number;
  category: string;
  emoji: string;
  score: number;
}

export default function GiftQuizPage(): JSX.Element {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Rec[] | null>(null);

  const { data: questions, isLoading: qLoad } = api.giftQuiz.questions.useQuery() as {
    data: Question[] | undefined;
    isLoading: boolean;
  };
  const {
    data: recs,
    isLoading: rLoad,
    refetch,
  } = api.giftQuiz.recommend.useQuery({ answers }, { enabled: false }) as {
    data: Rec[] | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const qs = questions ?? [];
  const currentQ = qs[step];
  const totalSteps = qs.length;

  const handleAnswer = (optionKey: string) => {
    if (!currentQ) return;
    const updated = { ...answers, [currentQ.id]: optionKey };
    setAnswers(updated);
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setAnswers(updated);
      refetch();
    }
  };

  const recommendations = recs ?? result ?? [];

  if (qLoad) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24">
        <CardSkeleton />
      </div>
    );
  }

  if (recommendations.length > 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-10">
          <span className="text-6xl">🎁</span>
          <h1 className="mt-4 text-3xl font-bold">توصيات الهدايا</h1>
          <p className="mt-2 text-text-secondary">بناءً على إجاباتكِ، هذه أفضل الهدايا المقترحة</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {recommendations.map((r) => (
            <Card key={r.id} padding="lg" className="hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <span className="text-5xl">{r.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-100 dark:bg-brand-900 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                      {r.score}% تطابق
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold">{r.nameAr}</h3>
                  <p className="text-sm text-text-secondary mt-1">{r.descAr}</p>
                  <p className="mt-3 text-2xl font-extrabold text-brand-600">
                    {formatCurrency(r.price)} ر.س
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link href="/marketplace">
                      <Button size="sm">🛍️ تسوقي الآن</Button>
                    </Link>
                    <Link href="/gift-cards">
                      <Button size="sm" variant="ghost">
                        بطاقة هدية 🎁
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setStep(0);
              setAnswers({});
              setResult(null);
            }}
          >
            🔄 إعادة الاختبار
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-6xl">🎁</span>
        <h1 className="mt-4 text-3xl font-bold">اختبار توصية الهدايا</h1>
        <p className="mt-2 text-text-secondary">أجيبي على الأسئلة لاكتشاف الهدية المثالية</p>
      </div>

      {currentQ && (
        <Card padding="lg">
          {/* Progress */}
          <div className="flex gap-1 mb-6">
            {qs.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>
          <p className="text-xs text-text-tertiary mb-1">
            السؤال {step + 1} من {totalSteps}
          </p>
          <h2 className="text-xl font-bold mb-6">{currentQ.questionAr}</h2>
          <div className="space-y-2">
            {currentQ.options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleAnswer(opt.key)}
                className="w-full rounded-xl border-2 border-edge dark:border-gray-700 p-4 text-right hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all"
              >
                {opt.labelAr}
              </button>
            ))}
          </div>
        </Card>
      )}

      {rLoad && <CardSkeleton />}
    </div>
  );
}
