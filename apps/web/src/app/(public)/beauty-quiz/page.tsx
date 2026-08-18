'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const questions = [
  {
    id: 'occasion',
    text: 'marketing.beauty-quiz.q-occasion',
    options: [
      { label: 'marketing.beauty-quiz.opt-daily', value: 'daily', icon: '️' },
      { label: 'marketing.beauty-quiz.opt-special', value: 'special', icon: '' },
      { label: 'marketing.beauty-quiz.opt-wedding', value: 'wedding', icon: '' },
      { label: 'marketing.beauty-quiz.opt-relax', value: 'relax', icon: '‍️' },
      { label: 'marketing.beauty-quiz.opt-new', value: 'new', icon: '' },
    ],
  },
  {
    id: 'focus',
    text: 'marketing.beauty-quiz.q-focus',
    options: [
      { label: 'marketing.beauty-quiz.opt-hair', value: 'hair', icon: '‍️' },
      { label: 'marketing.beauty-quiz.opt-skin', value: 'skin', icon: '' },
      { label: 'marketing.beauty-quiz.opt-makeup', value: 'makeup', icon: '' },
      { label: 'marketing.beauty-quiz.opt-nails', value: 'nails', icon: '' },
      { label: 'marketing.beauty-quiz.opt-body', value: 'body', icon: '' },
    ],
  },
  {
    id: 'budget',
    text: 'marketing.beauty-quiz.q-budget',
    options: [
      { label: 'marketing.beauty-quiz.opt-low', value: 'low', icon: '' },
      { label: 'marketing.beauty-quiz.opt-mid', value: 'mid', icon: '' },
      { label: 'marketing.beauty-quiz.opt-high', value: 'high', icon: '' },
    ],
  },
] as const;

const recommendations = {
  'wedding-hair-high': {
    title: 'marketing.beauty-quiz.rec-wedding-hair-high',
    services: [
      'marketing.beauty-quiz.svc-hair-styling',
      'marketing.beauty-quiz.svc-bridal-makeup',
      'marketing.beauty-quiz.svc-manicure',
      'marketing.beauty-quiz.svc-pedicure',
      'marketing.beauty-quiz.svc-skincare',
    ],
    link: '/bridal-concierge',
  },
  'wedding-makeup-high': {
    title: 'marketing.beauty-quiz.rec-wedding-makeup-high',
    services: [
      'marketing.beauty-quiz.svc-bridal-makeup',
      'marketing.beauty-quiz.svc-hair-styling',
      'marketing.beauty-quiz.svc-lashes',
      'marketing.beauty-quiz.svc-teeth-whitening',
    ],
    link: '/bridal-concierge',
  },
  'special-hair-mid': {
    title: 'marketing.beauty-quiz.rec-special-hair-mid',
    services: [
      'marketing.beauty-quiz.svc-hair-styling',
      'marketing.beauty-quiz.svc-evening-makeup',
      'marketing.beauty-quiz.svc-manicure',
    ],
    link: '/services',
  },
  'special-makeup-mid': {
    title: 'marketing.beauty-quiz.rec-special-makeup-mid',
    services: [
      'marketing.beauty-quiz.svc-evening-makeup',
      'marketing.beauty-quiz.svc-lashes',
      'marketing.beauty-quiz.svc-brow-shaping',
    ],
    link: '/services',
  },
  'daily-skin-low': {
    title: 'marketing.beauty-quiz.rec-daily-skin-low',
    services: [
      'marketing.beauty-quiz.svc-facial-cleanse',
      'marketing.beauty-quiz.svc-face-mask',
      'marketing.beauty-quiz.svc-skincare',
    ],
    link: '/services',
  },
  'relax-body-mid': {
    title: 'marketing.beauty-quiz.rec-relax-body-mid',
    services: [
      'marketing.beauty-quiz.svc-massage',
      'marketing.beauty-quiz.svc-moroccan-bath',
      'marketing.beauty-quiz.svc-body-care',
    ],
    link: '/services',
  },
  default: {
    title: 'marketing.beauty-quiz.rec-default',
    services: [
      'marketing.beauty-quiz.svc-makeup',
      'marketing.beauty-quiz.svc-hair-styling',
      'marketing.beauty-quiz.svc-manicure',
      'marketing.beauty-quiz.svc-skincare',
    ],
    link: '/services',
  },
} as const;

type Recommendation = (typeof recommendations)[keyof typeof recommendations];

export default function BeautyQuizPage(): JSX.Element {
  const { t } = useLocale();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Recommendation | null>(null);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (step < questions.length - 1) setStep(step + 1);
    else {
      const key = `${newAnswers['occasion']}-${newAnswers['focus']}-${newAnswers['budget']}`;
      const recMap: Record<string, Recommendation | undefined> = recommendations;
      setResult(recMap[key] ?? recommendations.default);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
          {t(result.title)}
        </h1>
        <p className="mt-2 text-text-secondary">{t('marketing.beauty-quiz.result-title')}</p>
        <div className="mt-6 space-y-2">
          {result.services.map((s) => (
            <Card key={s} padding="sm">
              <p className="font-medium text-text-primary dark:text-gray-100">{t(s)}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex gap-3 justify-center">
          <Link href={result.link}>
            <Button size="lg">{t('marketing.beauty-quiz.browse-services')}</Button>
          </Link>
          <Button variant="outline" onClick={reset}>
            {t('marketing.beauty-quiz.retry')}
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[step]!;
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8">
        <div className="mb-2 flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>
        <p className="text-xs text-text-tertiary">
          {step + 1} / {questions.length}
        </p>
      </div>
      <h2 className="mb-6 text-2xl font-bold text-text-primary dark:text-gray-100">{t(q.text)}</h2>
      <div className="space-y-3">
        {q.options.map((o) => (
          <button
            key={o.value}
            onClick={() => handleAnswer(q.id, o.value)}
            className="flex w-full items-center gap-4 rounded-xl border border-edge p-4 text-right transition-all hover:border-brand-400 hover:bg-brand-50 dark:border-gray-700 dark:hover:bg-brand-950"
          >
            <span className="text-2xl">{o.icon}</span>
            <span className="text-lg font-medium text-text-primary dark:text-gray-100">
              {t(o.label)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
