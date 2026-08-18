'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Quiz Card — fun beauty knowledge quiz.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyQuizCard />
 */

interface QuizQuestion {
  question: { ar: string; en: string };
  options: { ar: string; en: string }[];
  correct: number;
  explanation: { ar: string; en: string };
}

const QUESTIONS: QuizQuestion[] = [
  {
    question: {
      ar: 'كم مرة يجب غسل الوجه يومياً؟',
      en: 'How many times should you wash your face daily?',
    },
    options: [
      { ar: 'مرة واحدة', en: 'Once' },
      { ar: 'مرتين', en: 'Twice' },
      { ar: 'ثلاث مرات', en: 'Three times' },
      { ar: 'أربع مرات', en: 'Four times' },
    ],
    correct: 1,
    explanation: {
      ar: 'مرتين يومياً — صباحاً ومساءً. الإفراط في الغسل يزيل الزيوت الطبيعية.',
      en: 'Twice daily — morning and evening. Over-washing strips natural oils.',
    },
  },
  {
    question: {
      ar: 'ما هو أهم منتج للعناية بالبشرة؟',
      en: 'What is the most important skincare product?',
    },
    options: [
      { ar: 'كريم أساس', en: 'Foundation' },
      { ar: 'واقي شمس', en: 'Sunscreen' },
      { ar: 'تونر', en: 'Toner' },
      { ar: 'مقشر', en: 'Exfoliator' },
    ],
    correct: 1,
    explanation: {
      ar: 'واقي الشمس هو أهم منتج — يحمي من التجاعيد والتصبغات وسرطان الجلد.',
      en: 'Sunscreen is the most important product — it protects against wrinkles, pigmentation and skin cancer.',
    },
  },
  {
    question: {
      ar: 'كم ساعة نوم تحتاج البشرة للتجدد؟',
      en: 'How many hours of sleep does your skin need to regenerate?',
    },
    options: [
      { ar: '5 ساعات', en: '5 hours' },
      { ar: '6 ساعات', en: '6 hours' },
      { ar: '7-8 ساعات', en: '7-8 hours' },
      { ar: '10 ساعات', en: '10 hours' },
    ],
    correct: 2,
    explanation: {
      ar: '7-8 ساعات — أثناء النوم العميق، تنتج البشرة الكولاجين وتجدد خلاياها.',
      en: '7-8 hours — during deep sleep, the skin produces collagen and renews its cells.',
    },
  },
];

const OPTION_LETTERS: { ar: string; en: string }[] = [
  { ar: 'أ', en: 'A' },
  { ar: 'ب', en: 'B' },
  { ar: 'ج', en: 'C' },
  { ar: 'د', en: 'D' },
];

const SCORE_FEEDBACK = {
  perfect: { ar: 'ممتاز! أنتِ خبيرة جمال ', en: 'Excellent! You are a beauty expert ' },
  good: { ar: 'جيد! واصلي التعلم ', en: 'Good! Keep learning ' },
  ok: { ar: 'لا بأس — تعلمي المزيد ', en: 'Not bad — learn more ' },
};

interface BeautyQuizCardProps {
  className?: string;
  /** Title of the quiz */
  title?: string;
  /** Title shown on the results screen */
  doneTitle?: string;
  /** Button to retry the quiz */
  retryLabel?: string;
  /** Feedback shown for a correct answer */
  correctLabel?: string;
  /** Feedback shown for a wrong answer */
  wrongLabel?: string;
  /** Button to go to the next question */
  nextQuestionLabel?: string;
  /** Button to show the result */
  resultLabel?: string;
  /** Locale for internal quiz data strings */
  locale?: 'ar' | 'en';
}

export function BeautyQuizCard({
  className = '',
  title = 'اختبار الجمال',
  doneTitle = 'انتهى الاختبار!',
  retryLabel = 'حاولي مرة أخرى',
  correctLabel = ' صحيح! ',
  wrongLabel = ' خطأ! ',
  nextQuestionLabel = 'السؤال التالي ←',
  resultLabel = 'النتيجة ',
  locale = 'ar',
}: BeautyQuizCardProps): JSX.Element {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[qIndex]!;
  const isCorrect = selected === q.correct;

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex((p) => p + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-teal-100 bg-white p-5 text-center dark:border-teal-900 dark:bg-gray-900',
          className,
        )}
      >
        <span className="text-4xl" aria-hidden="true"></span>
        <h4 className="mt-2 text-sm font-bold text-teal-700 dark:text-teal-300">{doneTitle}</h4>
        <p className="mt-1 text-lg font-bold text-teal-800 dark:text-teal-200">
          {score}/{QUESTIONS.length}
        </p>
        <p className="text-[10px] text-text-tertiary dark:text-gray-400 mt-1">
          {score === QUESTIONS.length
            ? SCORE_FEEDBACK.perfect[locale]
            : score >= 2
              ? SCORE_FEEDBACK.good[locale]
              : SCORE_FEEDBACK.ok[locale]}
        </p>
        <button
          type="button"
          onClick={() => {
            setQIndex(0);
            setSelected(null);
            setScore(0);
            setDone(false);
          }}
          className="mt-3 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
        >
          {retryLabel}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true"></span>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
        </div>
        <span className="text-[10px] text-text-tertiary dark:text-gray-500">
          {qIndex + 1}/{QUESTIONS.length}
        </span>
      </div>

      {/* Question */}
      <p className="mt-3 text-xs font-bold text-text-primary dark:text-gray-100">
        {q.question[locale]}
      </p>

      {/* Options */}
      <div className="mt-2 space-y-1.5">
        {q.options.map((opt, i) => {
          let bg = 'bg-gray-50 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-950';
          if (selected !== null) {
            if (i === q.correct)
              bg = 'bg-emerald-100 border-emerald-400 dark:bg-emerald-950 dark:border-emerald-600';
            else if (i === selected)
              bg = 'bg-rose-100 border-rose-400 dark:bg-rose-950 dark:border-rose-600';
            else bg = 'bg-gray-50 opacity-50 dark:bg-gray-800';
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              className={cn(
                'w-full rounded-xl border-2 border-transparent px-3 py-2.5 text-left text-xs transition-all',
                bg,
              )}
            >
              <span className="font-bold">{OPTION_LETTERS[i]?.[locale]}.</span> {opt[locale]}
              {selected !== null && i === q.correct && <span className="float-right"></span>}
              {selected === i && i !== q.correct && <span className="float-right"></span>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {selected !== null && (
        <div className="mt-2 rounded-lg bg-teal-50 p-2.5 dark:bg-teal-950">
          <p className="text-[10px] text-teal-800 dark:text-teal-200">
            {isCorrect ? correctLabel : wrongLabel}
            {q.explanation[locale]}
          </p>
        </div>
      )}

      {/* Next */}
      {selected !== null && (
        <button
          type="button"
          onClick={next}
          className="mt-2 w-full rounded-xl bg-teal-600 py-2 text-xs font-bold text-white hover:bg-teal-700"
        >
          {qIndex < QUESTIONS.length - 1 ? nextQuestionLabel : resultLabel}
        </button>
      )}
    </div>
  );
}
