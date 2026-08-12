'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/ui';
import Link from 'next/link';

export default function ServiceMatchmakerPage(): JSX.Element {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [searchAnswers, setSearchAnswers] = useState<Record<string, string> | null>(null);

  const { data: questions } = api.serviceMatchmaker.questions.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const { data: results, isLoading } = api.serviceMatchmaker.match.useQuery(
    { answers: searchAnswers ?? {} },
    { enabled: !!searchAnswers },
  ) as { data: Array<Record<string, unknown>> | undefined; isLoading: boolean };

  const qs = (questions ?? []) as Array<Record<string, unknown>>;
  const currentQ = qs[step];

  const handleAnswer = (key: string) => {
    const updated = { ...answers, [currentQ?.id as string]: key };
    setAnswers(updated);
    if (step < qs.length - 1) setStep(step + 1);
    else setSearchAnswers(updated);
  };

  const services = results ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold">Service Matchmaker</h1>
        <p className="mt-2 text-text-secondary">أجيبي على ٣ أسئلة لاكتشاف الخدمة المثالية لكِ</p>
      </div>

      {searchAnswers ? (
        isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((s: Record<string, unknown>) => (
              <Card
                key={s.id as number}
                padding="lg"
                className="flex items-center gap-4 hover:shadow-lg transition-all"
              >
                <span className="text-4xl">{s.emoji as string}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{s.nameAr as string}</h3>
                  <span className="rounded-full bg-brand-100 dark:bg-brand-900 px-2 py-0.5 text-xs font-bold text-brand-700">
                    {s.score as number}% تطابق
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-brand-600">
                    {formatCurrency(s.price as number)} ر.س
                  </p>
                  <Link href="/bookings/create">
                    <Button size="sm" className="mt-2">
                      احجزي ←
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(0);
                  setAnswers({});
                  setSearchAnswers(null);
                }}
              >
                 إعادة
              </Button>
            </div>
          </div>
        )
      ) : currentQ ? (
        <Card padding="lg">
          <div className="flex gap-1 mb-6">
            {qs.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>
          <p className="text-xs text-text-tertiary mb-1">
            السؤال {step + 1} من {qs.length}
          </p>
          <h2 className="text-xl font-bold mb-6">{currentQ.q as string}</h2>
          <div className="space-y-2">
            {(currentQ.opts as Array<Record<string, unknown>>).map((o: Record<string, unknown>) => (
              <button
                key={o.k as string}
                onClick={() => handleAnswer(o.k as string)}
                className="w-full rounded-xl border-2 border-edge dark:border-gray-700 p-4 text-right hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all"
              >
                {o.l as string}
              </button>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
