'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Flash Card — interactive beauty term flashcard for learning.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyFlashCard />
 */

interface FlashCard {
  term: string;
  emoji: string;
  definition: string;
  category: string;
}

const CARDS: FlashCard[] = [
  { term: 'كولاجين', emoji: '🧬', definition: 'بروتين طبيعي في البشرة يمنحها المرونة والشباب. يقل إنتاجه مع التقدم في العمر.', category: 'مكونات' },
  { term: 'هيالورونيك أسيد', emoji: '💧', definition: 'مادة طبيعية في البشرة تجذب الرطوبة وتحتفظ بها. الملعقة الواحدة تحمل 6 لترات ماء!', category: 'مكونات' },
  { term: 'نياسيناميد', emoji: '✨', definition: 'فيتامين B3 — يعالج حبوب الشباب، يفتح التصبغات، يقلص المسام، ويقوي حاجز البشرة.', category: 'مكونات' },
  { term: 'ريتينول', emoji: '⏳', definition: 'فيتامين A — أقوى مضاد للتجاعيد. يستخدم مساءً فقط لأنه حساس للشمس.', category: 'مكونات' },
  { term: 'SPF', emoji: '☀️', definition: 'Sun Protection Factor — مقياس حماية من أشعة الشمس. الحد الأدنى الموصى به: SPF 30.', category: 'حماية' },
  { term: 'فيتزباتريك', emoji: '🎨', definition: 'مقياس يقسم ألوان البشرة إلى 6 أنواع. البشرة السعودية غالباً من النوع 3-5.', category: 'علمي' },
];

interface BeautyFlashCardProps {
  className?: string;
}

export function BeautyFlashCard({
  className = '',
}: BeautyFlashCardProps): JSX.Element {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = CARDS[index]!;

  const next = () => {
    setFlipped(false);
    setIndex((p) => (p + 1) % CARDS.length);
  };

  return (
    <div className={cn('rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🃏</span>
          <div>
            <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">
              بطاقة تعليمية
            </h4>
            <p className="text-[10px] text-purple-500 dark:text-purple-400">
              {index + 1}/{CARDS.length}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] text-purple-600 dark:bg-purple-950 dark:text-purple-400">
          {card.category}
        </span>
      </div>

      {/* Flash card */}
      <button
        type="button"
        onClick={() => setFlipped(!flipped)}
        className={cn(
          'mt-3 w-full rounded-xl border-2 p-6 text-center transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center',
          flipped
            ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
            : 'border-dashed border-purple-200 bg-white hover:bg-purple-50 dark:border-purple-800 dark:bg-gray-800 dark:hover:bg-purple-950',
        )}
      >
        {!flipped ? (
          <>
            <span className="text-3xl" aria-hidden="true">{card.emoji}</span>
            <p className="mt-2 text-lg font-bold text-purple-800 dark:text-purple-200">
              {card.term}
            </p>
            <p className="mt-1 text-[9px] text-text-tertiary dark:text-gray-500">
              اضغطي للكشف عن التعريف
            </p>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-purple-800 dark:text-purple-200">
            {card.definition}
          </p>
        )}
      </button>

      {/* Navigation */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => { setFlipped(false); setIndex((p) => (p - 1 + CARDS.length) % CARDS.length); }}
          className="flex-1 rounded-lg border border-purple-200 py-1.5 text-[10px] font-bold text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400"
        >
          ← السابقة
        </button>
        <button
          type="button"
          onClick={next}
          className="flex-1 rounded-lg bg-purple-600 py-1.5 text-[10px] font-bold text-white hover:bg-purple-700"
        >
          التالية ←
        </button>
      </div>
    </div>
  );
}
