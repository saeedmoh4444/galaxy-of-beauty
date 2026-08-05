'use client';

import { useState } from 'react';

/**
 * Net Promoter Score (NPS) survey — "How likely to recommend?"
 * Shows after booking completion, captures 0-10 score + optional feedback.
 *
 * Usage:
 *   <NPSSurvey onSubmit={(score, feedback) => { ... }} />
 */

interface NPSSurveyProps {
  onSubmit: (score: number, feedback?: string) => void;
  onDismiss: () => void;
  className?: string;
}

const SCORE_LABELS: Record<number, string> = {
  0: '😡', 1: '😤', 2: '😞', 3: '😕', 4: '😐',
  5: '🤔', 6: '🙂', 7: '😊', 8: '😄', 9: '😍', 10: '🤩',
};

export function NPSSurvey({ onSubmit, onDismiss, className = '' }: NPSSurveyProps): JSX.Element {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  return (
    <div className={`rounded-2xl border border-edge bg-white p-6 dark:border-gray-700 dark:bg-gray-900 ${className}`}>
      <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">
        كيف كانت تجربتك؟
      </h3>
      <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
        ما مدى احتمالية أن توصي صديقاتك بجالكسي بيوتي؟
      </p>

      {score === null ? (
        <div className="mt-4 flex justify-between gap-1">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              onClick={() => setScore(i)}
              className="flex flex-col items-center gap-1 rounded-lg p-2 text-lg transition-all hover:scale-125 hover:bg-brand-50 dark:hover:bg-brand-950"
              title={`${i}`}
            >
              <span>{SCORE_LABELS[i]}</span>
              <span className="text-[10px] text-text-tertiary">{i}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="text-center">
            <span className="text-4xl">{SCORE_LABELS[score]}</span>
            <p className="mt-1 text-sm font-semibold text-text-primary dark:text-gray-100">
              {score >= 9 ? 'رائع! شكراً لكِ 🌟' : score >= 7 ? 'شكراً لتقييمكِ 😊' : 'نعتذر عن التجربة 😔'}
            </p>
          </div>
          <textarea
            placeholder="أخبرينا كيف يمكننا التحسين..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-edge bg-surface-muted px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onSubmit(score, feedback || undefined)}
              className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              إرسال التقييم
            </button>
            <button
              onClick={onDismiss}
              className="rounded-lg border border-edge px-4 py-2 text-sm text-text-secondary hover:bg-surface-muted dark:border-gray-700 dark:hover:bg-gray-800"
            >
              تخطي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
