'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Skincare Routine Builder — interactive personalized skincare routine.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <SkincareRoutineBuilder />
 */

type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
type SkinGoal = 'anti_aging' | 'brightening' | 'acne' | 'hydration' | 'even_tone';

const SKIN_TYPES: { value: SkinType; emoji: string; label: { ar: string; en: string } }[] = [
  { value: 'oily', emoji: '', label: { ar: 'دهنية', en: 'Oily' } },
  { value: 'dry', emoji: '', label: { ar: 'جافة', en: 'Dry' } },
  { value: 'combination', emoji: '', label: { ar: 'مختلطة', en: 'Combination' } },
  { value: 'sensitive', emoji: '', label: { ar: 'حساسة', en: 'Sensitive' } },
  { value: 'normal', emoji: '', label: { ar: 'طبيعية', en: 'Normal' } },
];

const GOALS: { value: SkinGoal; emoji: string; label: { ar: string; en: string } }[] = [
  { value: 'anti_aging', emoji: '', label: { ar: 'مكافحة الشيخوخة', en: 'Anti-aging' } },
  { value: 'brightening', emoji: '', label: { ar: 'تفتيح', en: 'Brightening' } },
  { value: 'acne', emoji: '', label: { ar: 'علاج حبوب', en: 'Acne treatment' } },
  { value: 'hydration', emoji: '', label: { ar: 'ترطيب', en: 'Hydration' } },
  { value: 'even_tone', emoji: '', label: { ar: 'توحيد لون', en: 'Even tone' } },
];

const ROUTINE_STEPS: Record<SkinType, { ar: string; en: string }[]> = {
  oily: [
    { ar: 'غسول جل', en: 'Gel cleanser' },
    { ar: 'تونر خالٍ من الكحول', en: 'Alcohol-free toner' },
    { ar: 'سيروم نياسيناميد', en: 'Niacinamide serum' },
    { ar: 'مرطب جل خفيف', en: 'Light gel moisturizer' },
    { ar: 'واقي شمس', en: 'Sunscreen' },
  ],
  dry: [
    { ar: 'غسول كريمي', en: 'Creamy cleanser' },
    { ar: 'تونر مرطب', en: 'Hydrating toner' },
    { ar: 'سيروم هيالورونيك', en: 'Hyaluronic serum' },
    { ar: 'مرطب غني', en: 'Rich moisturizer' },
    { ar: 'زيت وجه', en: 'Face oil' },
  ],
  combination: [
    { ar: 'غسول متوازن', en: 'Balanced cleanser' },
    { ar: 'تونر', en: 'Toner' },
    { ar: 'سيروم خفيف', en: 'Light serum' },
    { ar: 'مرطب جل', en: 'Gel moisturizer' },
    { ar: 'واقي شمس', en: 'Sunscreen' },
  ],
  sensitive: [
    { ar: 'غسول لطيف', en: 'Gentle cleanser' },
    { ar: 'تونر مهدئ', en: 'Soothing toner' },
    { ar: 'سيروم سيراميد', en: 'Ceramide serum' },
    { ar: 'مرطب مهدئ', en: 'Soothing moisturizer' },
    { ar: 'واقي شمس معدني', en: 'Mineral sunscreen' },
  ],
  normal: [
    { ar: 'غسول لطيف', en: 'Gentle cleanser' },
    { ar: 'تونر', en: 'Toner' },
    { ar: 'سيروم فيتامين سي', en: 'Vitamin C serum' },
    { ar: 'مرطب', en: 'Moisturizer' },
    { ar: 'واقي شمس', en: 'Sunscreen' },
  ],
};

interface SkincareRoutineBuilderProps {
  className?: string;
  /** Title of the result view */
  resultTitle?: string;
  /** Note under the routine steps */
  routineNote?: string;
  /** Reset button label */
  resetLabel?: string;
  /** Header title of the builder */
  title?: string;
  /** Question shown when choosing skin type */
  skinQuestion?: string;
  /** Question shown when choosing a goal */
  goalQuestion?: string;
  /** Locale for internal data strings */
  locale?: 'ar' | 'en';
}

export function SkincareRoutineBuilder({
  className = '',
  resultTitle = 'روتينكِ المخصص',
  routineNote = 'الصباح: خطوات 1-5 · المساء: خطوات 1-4 (بدون واقي شمس)',
  resetLabel = 'بناء روتين جديد',
  title = 'بناء روتين العناية',
  skinQuestion = 'ما نوع بشرتكِ؟',
  goalQuestion = 'ما هدفكِ؟',
  locale = 'ar',
}: SkincareRoutineBuilderProps): JSX.Element {
  const [step, setStep] = useState<'skin' | 'goal' | 'result'>('skin');
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [goal, setGoal] = useState<SkinGoal | null>(null);

  const reset = () => {
    setStep('skin');
    setSkinType(null);
    setGoal(null);
  };

  // Result view
  if (step === 'result' && skinType) {
    const steps = ROUTINE_STEPS[skinType];

    return (
      <div
        className={cn(
          'rounded-2xl border border-pink-100 bg-white p-5 dark:border-pink-900 dark:bg-gray-900',
          className,
        )}
      >
        <div className="text-center">
          <span className="text-3xl" aria-hidden="true"></span>
          <h4 className="mt-1 text-sm font-bold text-pink-700 dark:text-pink-300">{resultTitle}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">
            {SKIN_TYPES.find((s) => s.value === skinType)!.emoji}{' '}
            {SKIN_TYPES.find((s) => s.value === skinType)!.label[locale]}
            {goal &&
              ` · ${GOALS.find((g) => g.value === goal)!.emoji} ${GOALS.find((g) => g.value === goal)!.label[locale]}`}
          </p>
        </div>

        {/* Steps */}
        <div className="mt-3 space-y-1.5">
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2.5 dark:bg-pink-950"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-200 text-[10px] font-bold text-pink-700 dark:bg-pink-800 dark:text-pink-300">
                {i + 1}
              </span>
              <span className="text-xs text-pink-800 dark:text-pink-200">{s[locale]}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
          <p className="text-center text-[10px] text-amber-700 dark:text-amber-300">
            {routineNote}
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-3 w-full rounded-xl border border-pink-200 py-2 text-xs font-bold text-pink-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300"
        >
          {resetLabel}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-5 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">
          {step === 'skin' ? skinQuestion : goalQuestion}
        </p>
      </div>

      {/* Progress */}
      <div className="mt-3 flex gap-1">
        <div
          className={cn(
            'h-1 flex-1 rounded-full',
            step === 'skin' ? 'bg-pink-500' : 'bg-pink-200 dark:bg-pink-800',
          )}
        />
        <div
          className={cn(
            'h-1 flex-1 rounded-full',
            step === 'goal' ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700',
          )}
        />
      </div>

      {/* Options */}
      <div className="mt-3 space-y-1.5">
        {step === 'skin' &&
          SKIN_TYPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setSkinType(s.value);
                setStep('goal');
              }}
              className="flex w-full items-center gap-2 rounded-xl bg-pink-50 px-3 py-2.5 text-xs font-bold text-pink-700 hover:bg-pink-100 dark:bg-pink-950 dark:text-pink-300 dark:hover:bg-pink-900 transition-colors"
            >
              <span>{s.emoji}</span> {s.label[locale]}
            </button>
          ))}

        {step === 'goal' &&
          GOALS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => {
                setGoal(g.value);
                setStep('result');
              }}
              className="flex w-full items-center gap-2 rounded-xl bg-pink-50 px-3 py-2.5 text-xs font-bold text-pink-700 hover:bg-pink-100 dark:bg-pink-950 dark:text-pink-300 dark:hover:bg-pink-900 transition-colors"
            >
              <span>{g.emoji}</span> {g.label[locale]}
            </button>
          ))}
      </div>
    </div>
  );
}
