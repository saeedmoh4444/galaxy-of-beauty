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
  className?: string;
}

const COMMANDS = [
  { emoji: '🎤', text: 'احجزي لي مكياج يوم الخميس' },
  { emoji: '🔍', text: 'ابحثي عن خبيرة قريبة مني' },
  { emoji: '⭐', text: 'قيمي آخر جلسة لي' },
  { emoji: '📅', text: 'متى موعدي القادم؟' },
];

export function BeautyVoiceAssistantCard({
  onActivate,
  className = '',
}: BeautyVoiceAssistantCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-5 dark:border-violet-900 dark:from-violet-950 dark:to-purple-950',
        className,
      )}
    >
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-200 to-purple-200 text-2xl dark:from-violet-800 dark:to-purple-800 animate-pulse">
          🎤
        </div>
        <h4 className="mt-2 text-sm font-bold text-violet-800 dark:text-violet-200">
          المساعد الصوتي
        </h4>
        <p className="text-[10px] text-violet-500 dark:text-violet-400">
          تحدثي — ونحن ننفذ
        </p>
      </div>

      {/* Voice button */}
      <button
        type="button"
        onClick={onActivate}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 py-3 text-sm font-bold text-white hover:from-violet-600 hover:to-purple-600 active:scale-[0.98] transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900"
      >
        🎤 اضغطي وتحدثي
      </button>

      {/* Example commands */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-violet-700 dark:text-violet-300">
          💬 جربي قول
        </p>
        <div className="mt-1.5 space-y-1">
          {COMMANDS.map((cmd) => (
            <div
              key={cmd.text}
              className="flex items-center gap-2 rounded-lg bg-white/50 px-2.5 py-1.5 dark:bg-gray-800/50"
            >
              <span className="text-xs" aria-hidden="true">{cmd.emoji}</span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300 italic">
                &ldquo;{cmd.text}&rdquo;
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="mt-2 flex justify-center gap-1.5">
        <span className="rounded-full bg-white/60 px-2 py-0.5 text-[9px] text-violet-600 dark:bg-gray-800/60 dark:text-violet-400">
          🇸🇦 العربية
        </span>
        <span className="rounded-full bg-white/60 px-2 py-0.5 text-[9px] text-violet-600 dark:bg-gray-800/60 dark:text-violet-400">
          🇬🇧 English
        </span>
      </div>

      <p className="mt-2 text-center text-[9px] text-violet-500 dark:text-violet-400">
        🎤 &ldquo;يداكِ مشغولتان — وصوتكِ يكفي&rdquo;
      </p>
    </div>
  );
}
