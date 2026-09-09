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
  term: { ar: string; en: string };
  emoji: string;
  definition: { ar: string; en: string };
  category: { ar: string; en: string };
}

const CARDS: FlashCard[] = [
  {
    term: { ar: 'كولاجين', en: 'Collagen' },
    emoji: '',
    definition: {
      ar: 'بروتين طبيعي في البشرة يمنحها المرونة والشباب. يقل إنتاجه مع التقدم في العمر.',
      en: 'A natural protein in the skin that gives it elasticity and youth. Its production decreases with age.',
    },
    category: { ar: 'مكونات', en: 'Ingredients' },
  },
  {
    term: { ar: 'هيالورونيك أسيد', en: 'Hyaluronic acid' },
    emoji: '',
    definition: {
      ar: 'مادة طبيعية في البشرة تجذب الرطوبة وتحتفظ بها. الملعقة الواحدة تحمل 6 لترات ماء!',
      en: 'A natural substance in the skin that attracts and retains moisture. One teaspoon holds 6 liters of water!',
    },
    category: { ar: 'مكونات', en: 'Ingredients' },
  },
  {
    term: { ar: 'نياسيناميد', en: 'Niacinamide' },
    emoji: '',
    definition: {
      ar: 'فيتامين B3 — يعالج حبوب الشباب، يفتح التصبغات، يقلص المسام، ويقوي حاجز البشرة.',
      en: 'Vitamin B3 — treats acne, brightens pigmentation, tightens pores, and strengthens the skin barrier.',
    },
    category: { ar: 'مكونات', en: 'Ingredients' },
  },
  {
    term: { ar: 'ريتينول', en: 'Retinol' },
    emoji: '',
    definition: {
      ar: 'فيتامين A — أقوى مضاد للتجاعيد. يستخدم مساءً فقط لأنه حساس للشمس.',
      en: 'Vitamin A — the most powerful anti-wrinkle ingredient. Used only at night as it is sun-sensitive.',
    },
    category: { ar: 'مكونات', en: 'Ingredients' },
  },
  {
    term: { ar: 'SPF', en: 'SPF' },
    emoji: '️',
    definition: {
      ar: 'Sun Protection Factor — مقياس حماية من أشعة الشمس. الحد الأدنى الموصى به: SPF 30.',
      en: 'Sun Protection Factor — a measure of sun protection. Recommended minimum: SPF 30.',
    },
    category: { ar: 'حماية', en: 'Protection' },
  },
  {
    term: { ar: 'فيتزباتريك', en: 'Fitzpatrick' },
    emoji: '',
    definition: {
      ar: 'مقياس يقسم ألوان البشرة إلى 6 أنواع. البشرة السعودية غالباً من النوع 3-5.',
      en: 'A scale dividing skin tones into 6 types. Saudi skin is usually type 3-5.',
    },
    category: { ar: 'علمي', en: 'Scientific' },
  },
];

interface BeautyFlashCardProps {
  className?: string;
  /** Header title */
  title?: string;
  /** Hint to flip the card */
  flipHint?: string;
  /** Previous card button label */
  prevLabel?: string;
  /** Next card button label */
  nextLabel?: string;
  /** Locale for internal card data strings */
  locale?: 'ar' | 'en';
}

export function BeautyFlashCard({
  className = '',
  title = 'بطاقة تعليمية',
  flipHint = 'اضغطي للكشف عن التعريف',
  prevLabel = '← السابقة',
  nextLabel = 'التالية ←',
  locale = 'ar',
}: BeautyFlashCardProps): JSX.Element {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = CARDS[index]!;

  const next = () => {
    setFlipped(false);
    setIndex((p) => (p + 1) % CARDS.length);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            🃏
          </span>
          <div>
            <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{title}</h4>
            <p className="text-[10px] text-brand-500 dark:text-brand-400">
              {index + 1}/{CARDS.length}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] text-brand-600 dark:bg-brand-950 dark:text-brand-400">
          {card.category[locale]}
        </span>
      </div>

      {/* Flash card */}
      <button
        type="button"
        onClick={() => setFlipped(!flipped)}
        className={cn(
          'mt-3 w-full rounded-xl border-2 p-6 text-center transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center',
          flipped
            ? 'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950'
            : 'border-dashed border-brand-200 bg-white hover:bg-brand-50 dark:border-brand-800 dark:bg-gray-800 dark:hover:bg-brand-950',
        )}
      >
        {!flipped ? (
          <>
            <span className="text-3xl" aria-hidden="true">
              {card.emoji}
            </span>
            <p className="mt-2 text-lg font-bold text-brand-800 dark:text-brand-200">
              {card.term[locale]}
            </p>
            <p className="mt-1 text-[9px] text-text-tertiary dark:text-text-secondary">
              {flipHint}
            </p>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-brand-800 dark:text-brand-200">
            {card.definition[locale]}
          </p>
        )}
      </button>

      {/* Navigation */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setFlipped(false);
            setIndex((p) => (p - 1 + CARDS.length) % CARDS.length);
          }}
          className="flex-1 rounded-lg border border-brand-200 py-1.5 text-[10px] font-bold text-brand-600 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400"
        >
          {prevLabel}
        </button>
        <button
          type="button"
          onClick={next}
          className="flex-1 rounded-lg bg-brand-600 py-1.5 text-[10px] font-bold text-white hover:bg-brand-700"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
