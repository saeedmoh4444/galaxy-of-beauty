'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Skin Quiz Card — interactive skin type discovery quiz.
 * From Phase W6: Education & Empowerment.
 *
 * Usage:
 *   <BeautySkinQuizCard />
 */

interface Question {
  question: { ar: string; en: string };
  emoji: string;
  options: { text: { ar: string; en: string }; score: Record<string, number> }[];
}

const QUESTIONS: Question[] = [
  {
    question: { ar: 'كيف تبدو بشرتكِ بعد غسلها؟', en: 'How does your skin feel after washing?' },
    emoji: '',
    options: [
      { text: { ar: 'مشدودة وجافة', en: 'Tight and dry' }, score: { dry: 3 } },
      { text: { ar: 'لامعة ودهنية', en: 'Shiny and oily' }, score: { oily: 3 } },
      {
        text: { ar: 'لامعة في T-zone فقط', en: 'Shiny in the T-zone only' },
        score: { combination: 3 },
      },
      { text: { ar: 'مريحة وطبيعية', en: 'Comfortable and normal' }, score: { normal: 3 } },
    ],
  },
  {
    question: {
      ar: 'كيف تتصرف بشرتكِ في الطقس الحار؟',
      en: 'How does your skin behave in hot weather?',
    },
    emoji: '️',
    options: [
      { text: { ar: 'تصبح دهنية جداً', en: 'Becomes very oily' }, score: { oily: 3 } },
      { text: { ar: 'تبقى جافة', en: 'Stays dry' }, score: { dry: 3 } },
      {
        text: { ar: 'دهنية في الجبهة والأنف', en: 'Oily on forehead and nose' },
        score: { combination: 3 },
      },
      { text: { ar: 'لا تتغير كثيراً', en: 'Does not change much' }, score: { normal: 3 } },
    ],
  },
  {
    question: {
      ar: 'هل بشرتكِ حساسة للمنتجات الجديدة؟',
      en: 'Is your skin sensitive to new products?',
    },
    emoji: '',
    options: [
      { text: { ar: 'نعم، تحمر بسرعة', en: 'Yes, it reddens quickly' }, score: { sensitive: 4 } },
      { text: { ar: 'أحياناً', en: 'Sometimes' }, score: { sensitive: 2 } },
      { text: { ar: 'نادراً', en: 'Rarely' }, score: { normal: 2 } },
      { text: { ar: 'أبداً، أتحمل أي شيء', en: 'Never, I tolerate anything' }, score: { oily: 2 } },
    ],
  },
];

const DEFAULT_RESULT_LABEL = { ar: 'طبيعية ', en: 'Normal ' };

interface BeautySkinQuizCardProps {
  onComplete?: (result: string) => void;
  className?: string;
  /** Title shown on the result screen */
  resultTitle?: string;
  /** Button to retake the quiz */
  retryLabel?: string;
  /** Locale for internal quiz data strings */
  locale?: 'ar' | 'en';
}

export function BeautySkinQuizCard({
  onComplete,
  className = '',
  resultTitle = 'نوع بشرتكِ',
  retryLabel = 'جربي مرة أخرى',
  locale = 'ar',
}: BeautySkinQuizCardProps): JSX.Element {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (score: Record<string, number>) => {
    const newScores = { ...scores };
    for (const [key, val] of Object.entries(score)) {
      newScores[key] = (newScores[key] ?? 0) + val;
    }
    setScores(newScores);

    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      const finalScores = { ...newScores };
      const winner = Object.entries(finalScores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'normal';
      const labels: Record<string, { ar: string; en: string }> = {
        oily: { ar: 'دهنية ', en: 'Oily ' },
        dry: { ar: 'جافة ', en: 'Dry ' },
        combination: { ar: 'مختلطة ', en: 'Combination ' },
        normal: { ar: 'طبيعية ', en: 'Normal ' },
        sensitive: { ar: 'حساسة ', en: 'Sensitive ' },
      };
      setResult((labels[winner] ?? DEFAULT_RESULT_LABEL)[locale]);
      onComplete?.(winner);
    }
  };

  if (result) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-teal-100 bg-white p-5 text-center dark:border-teal-900 dark:bg-gray-900',
          className,
        )}
      >
        <span className="text-4xl" aria-hidden="true"></span>
        <h4 className="mt-2 text-sm font-bold text-teal-700 dark:text-teal-300">{resultTitle}</h4>
        <p className="mt-2 text-2xl font-bold text-teal-800 dark:text-teal-200">{result}</p>
        <button
          type="button"
          onClick={() => {
            setStep(0);
            setScores({});
            setResult(null);
          }}
          className="mt-3 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
        >
          {retryLabel}
        </button>
      </div>
    );
  }

  const q = QUESTIONS[step]!;

  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg">{q.emoji}</span>
        <span className="text-[10px] text-text-tertiary dark:text-gray-500">
          {step + 1}/{QUESTIONS.length}
        </span>
      </div>
      <p className="mt-2 text-xs font-bold text-text-primary dark:text-gray-100">
        {q.question[locale]}
      </p>
      <div className="mt-3 space-y-1.5">
        {q.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleAnswer(opt.score)}
            className="w-full rounded-lg bg-teal-50 px-3 py-2.5 text-left text-[10px] font-medium text-teal-800 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-200 dark:hover:bg-teal-900 transition-colors"
          >
            {opt.text[locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
