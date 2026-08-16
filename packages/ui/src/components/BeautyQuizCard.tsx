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
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    question: 'كم مرة يجب غسل الوجه يومياً؟',
    options: ['مرة واحدة', 'مرتين', 'ثلاث مرات', 'أربع مرات'],
    correct: 1,
    explanation: 'مرتين يومياً — صباحاً ومساءً. الإفراط في الغسل يزيل الزيوت الطبيعية.',
  },
  {
    question: 'ما هو أهم منتج للعناية بالبشرة؟',
    options: ['كريم أساس', 'واقي شمس', 'تونر', 'مقشر'],
    correct: 1,
    explanation: 'واقي الشمس هو أهم منتج — يحمي من التجاعيد والتصبغات وسرطان الجلد.',
  },
  {
    question: 'كم ساعة نوم تحتاج البشرة للتجدد؟',
    options: ['5 ساعات', '6 ساعات', '7-8 ساعات', '10 ساعات'],
    correct: 2,
    explanation: '7-8 ساعات — أثناء النوم العميق، تنتج البشرة الكولاجين وتجدد خلاياها.',
  },
];

interface BeautyQuizCardProps {
  className?: string;
}

export function BeautyQuizCard({ className = '' }: BeautyQuizCardProps): JSX.Element {
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
        <h4 className="mt-2 text-sm font-bold text-teal-700 dark:text-teal-300">انتهى الاختبار!</h4>
        <p className="mt-1 text-lg font-bold text-teal-800 dark:text-teal-200">
          {score}/{QUESTIONS.length}
        </p>
        <p className="text-[10px] text-text-tertiary dark:text-gray-400 mt-1">
          {score === QUESTIONS.length
            ? 'ممتاز! أنتِ خبيرة جمال '
            : score >= 2
              ? 'جيد! واصلي التعلم '
              : 'لا بأس — تعلمي المزيد '}
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
          حاولي مرة أخرى
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
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">اختبار الجمال</h4>
        </div>
        <span className="text-[10px] text-text-tertiary dark:text-gray-500">
          {qIndex + 1}/{QUESTIONS.length}
        </span>
      </div>

      {/* Question */}
      <p className="mt-3 text-xs font-bold text-text-primary dark:text-gray-100">{q.question}</p>

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
              <span className="font-bold">{['أ', 'ب', 'ج', 'د'][i]}.</span> {opt}
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
            {isCorrect ? ' صحيح! ' : ' خطأ! '}
            {q.explanation}
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
          {qIndex < QUESTIONS.length - 1 ? 'السؤال التالي ←' : 'النتيجة '}
        </button>
      )}
    </div>
  );
}
