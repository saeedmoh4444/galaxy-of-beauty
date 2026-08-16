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

const SKIN_TYPES: { value: SkinType; emoji: string; label: string }[] = [
  { value: 'oily', emoji: '', label: 'دهنية' },
  { value: 'dry', emoji: '', label: 'جافة' },
  { value: 'combination', emoji: '', label: 'مختلطة' },
  { value: 'sensitive', emoji: '', label: 'حساسة' },
  { value: 'normal', emoji: '', label: 'طبيعية' },
];

const GOALS: { value: SkinGoal; emoji: string; label: string }[] = [
  { value: 'anti_aging', emoji: '', label: 'مكافحة الشيخوخة' },
  { value: 'brightening', emoji: '', label: 'تفتيح' },
  { value: 'acne', emoji: '', label: 'علاج حبوب' },
  { value: 'hydration', emoji: '', label: 'ترطيب' },
  { value: 'even_tone', emoji: '', label: 'توحيد لون' },
];

const ROUTINE_STEPS: Record<SkinType, string[]> = {
  oily: ['غسول جل', 'تونر خالٍ من الكحول', 'سيروم نياسيناميد', 'مرطب جل خفيف', 'واقي شمس'],
  dry: ['غسول كريمي', 'تونر مرطب', 'سيروم هيالورونيك', 'مرطب غني', 'زيت وجه'],
  combination: ['غسول متوازن', 'تونر', 'سيروم خفيف', 'مرطب جل', 'واقي شمس'],
  sensitive: ['غسول لطيف', 'تونر مهدئ', 'سيروم سيراميد', 'مرطب مهدئ', 'واقي شمس معدني'],
  normal: ['غسول لطيف', 'تونر', 'سيروم فيتامين سي', 'مرطب', 'واقي شمس'],
};

interface SkincareRoutineBuilderProps {
  className?: string;
}

export function SkincareRoutineBuilder({
  className = '',
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
          <h4 className="mt-1 text-sm font-bold text-pink-700 dark:text-pink-300">
            روتينكِ المخصص
          </h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">
            {SKIN_TYPES.find((s) => s.value === skinType)!.emoji}{' '}
            {SKIN_TYPES.find((s) => s.value === skinType)!.label}
            {goal &&
              ` · ${GOALS.find((g) => g.value === goal)!.emoji} ${GOALS.find((g) => g.value === goal)!.label}`}
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
              <span className="text-xs text-pink-800 dark:text-pink-200">{s}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
          <p className="text-center text-[10px] text-amber-700 dark:text-amber-300">
            الصباح: خطوات 1-5 · المساء: خطوات 1-4 (بدون واقي شمس)
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-3 w-full rounded-xl border border-pink-200 py-2 text-xs font-bold text-pink-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300"
        >
          بناء روتين جديد
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
        <h4 className="mt-1 text-sm font-bold text-pink-700 dark:text-pink-300">
          بناء روتين العناية
        </h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">
          {step === 'skin' ? 'ما نوع بشرتكِ؟' : 'ما هدفكِ؟'}
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
              <span>{s.emoji}</span> {s.label}
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
              <span>{g.emoji}</span> {g.label}
            </button>
          ))}
      </div>
    </div>
  );
}
