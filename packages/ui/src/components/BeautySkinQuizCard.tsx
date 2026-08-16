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
  question: string;
  emoji: string;
  options: { text: string; score: Record<string, number> }[];
}

const QUESTIONS: Question[] = [
  {
    question: 'كيف تبدو بشرتكِ بعد غسلها؟',
    emoji: '',
    options: [
      { text: 'مشدودة وجافة', score: { dry: 3 } },
      { text: 'لامعة ودهنية', score: { oily: 3 } },
      { text: 'لامعة في T-zone فقط', score: { combination: 3 } },
      { text: 'مريحة وطبيعية', score: { normal: 3 } },
    ],
  },
  {
    question: 'كيف تتصرف بشرتكِ في الطقس الحار؟',
    emoji: '️',
    options: [
      { text: 'تصبح دهنية جداً', score: { oily: 3 } },
      { text: 'تبقى جافة', score: { dry: 3 } },
      { text: 'دهنية في الجبهة والأنف', score: { combination: 3 } },
      { text: 'لا تتغير كثيراً', score: { normal: 3 } },
    ],
  },
  {
    question: 'هل بشرتكِ حساسة للمنتجات الجديدة؟',
    emoji: '',
    options: [
      { text: 'نعم، تحمر بسرعة', score: { sensitive: 4 } },
      { text: 'أحياناً', score: { sensitive: 2 } },
      { text: 'نادراً', score: { normal: 2 } },
      { text: 'أبداً، أتحمل أي شيء', score: { oily: 2 } },
    ],
  },
];

interface BeautySkinQuizCardProps {
  onComplete?: (result: string) => void;
  className?: string;
}

export function BeautySkinQuizCard({
  onComplete,
  className = '',
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
      const labels: Record<string, string> = {
        oily: 'دهنية ',
        dry: 'جافة ',
        combination: 'مختلطة ',
        normal: 'طبيعية ',
        sensitive: 'حساسة ',
      };
      setResult(labels[winner] ?? 'طبيعية ');
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
        <h4 className="mt-2 text-sm font-bold text-teal-700 dark:text-teal-300">نوع بشرتكِ</h4>
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
          جربي مرة أخرى
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
      <p className="mt-2 text-xs font-bold text-text-primary dark:text-gray-100">{q.question}</p>
      <div className="mt-3 space-y-1.5">
        {q.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleAnswer(opt.score)}
            className="w-full rounded-lg bg-teal-50 px-3 py-2.5 text-left text-[10px] font-medium text-teal-800 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-200 dark:hover:bg-teal-900 transition-colors"
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
