'use client';

import { cn } from '@galaxy/shared';

/**
 * Ask a Dermatologist Card — monthly live Q&A with board-certified dermatologist.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <AskDermatologistCard
 *     doctor={{ name: 'د. نورة القحطاني', specialty: 'الأمراض الجلدية والتجميل' }}
 *     nextSession="2026-08-20"
 *   />
 */

interface Doctor {
  name: string;
  specialty: string;
  credentials?: string;
  photo?: string;
}

interface AskDermatologistCardProps {
  doctor: Doctor;
  nextSession: string;
  /** Questions already submitted */
  questionsCount?: number;
  /** Whether user has submitted a question */
  hasSubmitted?: boolean;
  onSubmitQuestion?: (question: string) => void;
  onRegister?: () => void;
  certifiedBadgeText?: string;
  nextSessionLabel?: string;
  soonBadgeText?: string;
  sessionTimeText?: string;
  questionsSubmittedSuffix?: string;
  firstQuestionText?: string;
  placeholder?: string;
  submitButtonText?: string;
  submittedConfirmationText?: string;
  registerButtonText?: string;
  anonymityNoteText?: string;
  className?: string;
}

export function AskDermatologistCard({
  doctor,
  nextSession,
  questionsCount = 0,
  hasSubmitted = false,
  onSubmitQuestion,
  onRegister,
  className = '',
  certifiedBadgeText = '🩺 استشارية معتمدة',
  nextSessionLabel = 'الجلسة القادمة',
  soonBadgeText = 'قريباً',
  sessionTimeText = 'مساءً — مباشر على المنصة',
  questionsSubmittedSuffix = 'سؤال مقدّم من المجتمع',
  firstQuestionText = 'كوني أول من تسأل!',
  placeholder = 'اكتبي سؤالكِ للدكتورة...',
  submitButtonText = 'إرسال',
  submittedConfirmationText = 'تم إرسال سؤالكِ — سترد الدكتورة خلال الجلسة',
  registerButtonText = 'سجّلي حضوركِ الآن',
  anonymityNoteText = 'يمكنكِ تقديم سؤالكِ بشكل مجهول — خصوصيتكِ محمية',
}: AskDermatologistCardProps): JSX.Element {
  // Format date in Arabic
  const sessionDate = new Date(nextSession);
  const arabicDate = sessionDate.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isSoon = new Date(nextSession).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Doctor card */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-xl dark:from-blue-900 dark:to-sky-900">
          ‍️
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">{doctor.name}</h4>
          <p className="text-[10px] text-text-secondary dark:text-gray-300">{doctor.specialty}</p>
          {doctor.credentials && (
            <p className="text-[9px] text-text-tertiary dark:text-gray-500">{doctor.credentials}</p>
          )}
          <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            {certifiedBadgeText}
          </span>
        </div>
      </div>

      {/* Next session */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 p-3 dark:from-blue-950 dark:to-sky-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm" aria-hidden="true"></span>
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
              {nextSessionLabel}
            </span>
          </div>
          {isSoon && (
            <span className="rounded-full bg-blue-200 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-800 dark:text-blue-200">
              {soonBadgeText}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs font-bold text-blue-800 dark:text-blue-200">{arabicDate}</p>
        <p className="text-[10px] text-blue-500 dark:text-blue-400">8:00 {sessionTimeText}</p>
      </div>

      {/* Questions counter */}
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
        <span className="text-sm" aria-hidden="true"></span>
        <span className="text-[10px] text-text-secondary dark:text-gray-300">
          {questionsCount > 0 ? `${questionsCount} ${questionsSubmittedSuffix}` : firstQuestionText}
        </span>
      </div>

      {/* Question input */}
      {!hasSubmitted && (
        <div className="mt-2 flex gap-1.5">
          <input
            type="text"
            placeholder={placeholder}
            maxLength={200}
            className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100 dark:placeholder:text-blue-600"
          />
          <button
            type="button"
            onClick={() => onSubmitQuestion?.('')}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700"
          >
            {submitButtonText}
          </button>
        </div>
      )}

      {/* Submitted confirmation */}
      {hasSubmitted && (
        <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-center dark:bg-emerald-950">
          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            {submittedConfirmationText}
          </p>
        </div>
      )}

      {/* Register CTA */}
      <button
        type="button"
        onClick={onRegister}
        className="mt-2 w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        {registerButtonText}
      </button>

      {/* Anonymity note */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {anonymityNoteText}
      </p>
    </div>
  );
}
