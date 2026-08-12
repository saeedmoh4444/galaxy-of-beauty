'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Trivia Card — fun beauty facts for learning.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyTriviaCard />
 */

const TRIVIA = [
  { fact: 'البشرة هي أكبر عضو في جسم الإنسان — مساحتها حوالي 2 متر مربع', emoji: '' },
  { fact: 'النساء في المملكة ينفقن 6 مليارات ريال سنوياً على مستحضرات التجميل', emoji: '' },
  { fact: 'زيت الورد الطائفي من أندر وأغلى الزيوت العطرية في العالم', emoji: '' },
  { fact: 'الحناء تستخدم في الجزيرة العربية منذ أكثر من 5000 سنة', emoji: '' },
  { fact: 'شرب 8 أكواب من الماء يومياً يحسن مرونة البشرة بنسبة 28%', emoji: '' },
  { fact: 'النوم 8 ساعات يزيد إنتاج الكولاجين الطبيعي في البشرة', emoji: '' },
  { fact: 'الكحل العربي كان يستخدم لحماية العينين من أشعة الشمس والرمال', emoji: '️' },
  { fact: 'زيت الأرغان المغربي يحتوي على فيتامين E أكثر بـ 3 مرات من زيت الزيتون', emoji: '🫒' },
];

interface BeautyTriviaCardProps {
  className?: string;
}

export function BeautyTriviaCard({ className = '' }: BeautyTriviaCardProps): JSX.Element {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TRIVIA.length));
  const trivia = TRIVIA[index]!;

  const next = () => {
    setIndex((prev) => (prev + 1) % TRIVIA.length);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          
        </span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">هل تعلمين؟</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">
            معلومة جمالية {index + 1}/{TRIVIA.length}
          </p>
        </div>
      </div>

      {/* Fact card */}
      <div className="mt-3 rounded-xl bg-teal-50 p-4 text-center dark:bg-teal-950">
        <span className="text-3xl" aria-hidden="true">
          {trivia.emoji}
        </span>
        <p className="mt-2 text-xs leading-relaxed text-teal-800 dark:text-teal-200">
          {trivia.fact}
        </p>
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={next}
        className="mt-3 w-full rounded-xl border border-teal-200 py-2 text-[10px] font-bold text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-950 transition-colors"
      >
        المعلومة التالية ←
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         المعرفة جمال — تعلمي شيئاً جديداً كل يوم
      </p>
    </div>
  );
}
