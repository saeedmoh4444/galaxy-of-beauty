'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Voice Assistant Card — voice-guided beauty assistant.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautyVoiceAssistantCard onActivate={() => {}} />
 */

interface BeautyVoiceAssistantCardProps {
  onActivate?: () => void;
  /** Display language for built-in commands */
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  activateButtonText?: string;
  trySayLabel?: string;
  arabicLabel?: string;
  footerQuote?: string;
  className?: string;
}

const COMMANDS = [
  { emoji: '', text: { ar: 'احجزي لي مكياج يوم الخميس', en: 'Book me makeup on Thursday' } },
  { emoji: '', text: { ar: 'ابحثي عن خبيرة قريبة مني', en: 'Find a technician near me' } },
  { emoji: '', text: { ar: 'قيمي آخر جلسة لي', en: 'Rate my last session' } },
  { emoji: '', text: { ar: 'متى موعدي القادم؟', en: 'When is my next appointment?' } },
];

export function BeautyVoiceAssistantCard({
  onActivate,
  className = '',
  locale = 'ar',
  title = 'المساعد الصوتي',
  subtitle = 'تحدثي — ونحن ننفذ',
  activateButtonText = 'اضغطي وتحدثي',
  trySayLabel = ' جربي قول',
  arabicLabel = 'العربية',
  footerQuote = 'يداكِ مشغولتان — وصوتكِ يكفي',
}: BeautyVoiceAssistantCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-5 dark:border-violet-900 dark:from-violet-950 dark:to-purple-950',
        className,
      )}
    >
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-200 to-purple-200 text-2xl dark:from-violet-800 dark:to-purple-800 animate-pulse"></div>
        <h4 className="mt-2 text-sm font-bold text-violet-800 dark:text-violet-200">{title}</h4>
        <p className="text-[10px] text-violet-500 dark:text-violet-400">{subtitle}</p>
      </div>

      {/* Voice button */}
      <button
        type="button"
        onClick={onActivate}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 py-3 text-sm font-bold text-white hover:from-violet-600 hover:to-purple-600 active:scale-[0.98] transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900"
      >
        {activateButtonText}
      </button>

      {/* Example commands */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-violet-700 dark:text-violet-300">{trySayLabel}</p>
        <div className="mt-1.5 space-y-1">
          {COMMANDS.map((cmd) => (
            <div
              key={cmd.text.ar}
              className="flex items-center gap-2 rounded-lg bg-white/50 px-2.5 py-1.5 dark:bg-gray-800/50"
            >
              <span className="text-xs" aria-hidden="true">
                {cmd.emoji}
              </span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300 italic">
                &ldquo;{cmd.text[locale]}&rdquo;
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="mt-2 flex justify-center gap-1.5">
        <span className="rounded-full bg-white/60 px-2 py-0.5 text-[9px] text-violet-600 dark:bg-gray-800/60 dark:text-violet-400">
          {arabicLabel}
        </span>
        <span className="rounded-full bg-white/60 px-2 py-0.5 text-[9px] text-violet-600 dark:bg-gray-800/60 dark:text-violet-400">
          English
        </span>
      </div>

      <p className="mt-2 text-center text-[9px] text-violet-500 dark:text-violet-400">
        &ldquo;{footerQuote}&rdquo;
      </p>
    </div>
  );
}
