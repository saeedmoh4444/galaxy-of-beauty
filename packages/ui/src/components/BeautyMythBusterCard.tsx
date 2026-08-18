'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Myth Buster Card — debunks common beauty myths with science.
 * From Phase W6: Education & Empowerment — Myth Busters.
 *
 * Usage:
 *   <BeautyMythBusterCard
 *     myth="معجون الأسنان يعالج الحبوب"
 *     fact="معجون الأسنان يهيج البشرة ويسبب حروقاً كيميائية"
 *   />
 */

interface BeautyMythBusterCardProps {
  myth: string;
  fact: string;
  source?: string;
  category?: 'skincare' | 'haircare' | 'makeup' | 'general';
  onNextMyth?: () => void;
  mythOrFactTitle?: string;
  subtitle?: string;
  mythLabel?: string;
  revealButtonText?: string;
  verdictText?: string;
  sourcePrefix?: string;
  nextMythText?: string;
  footerText?: string;
  className?: string;
}

const CAT_EMOJIS = {
  skincare: '',
  haircare: '',
  makeup: '',
  general: '',
};

export function BeautyMythBusterCard({
  myth,
  fact,
  source,
  category = 'general',
  onNextMyth,
  className = '',
  mythOrFactTitle = 'خرافة أم حقيقة؟',
  subtitle = 'نكشف لكِ الحقيقة العلمية',
  mythLabel = '️ الخرافة الشائعة',
  revealButtonText = 'اكشفي الحقيقة',
  verdictText = 'خرافة!',
  sourcePrefix = 'المصدر: ',
  nextMythText = 'الخرافة التالية ←',
  footerText = 'المعرفة قوة — لا تصدقي كل ما تسمعينه عن الجمال',
}: BeautyMythBusterCardProps): JSX.Element {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-5 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">
            {CAT_EMOJIS[category]} {mythOrFactTitle}
          </h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>

      {/* Myth */}
      <div className="mt-3 rounded-xl bg-rose-50 p-4 dark:bg-rose-950">
        <p className="text-center text-[10px] font-bold text-rose-500 dark:text-rose-400">
          {mythLabel}
        </p>
        <p className="mt-1 text-center text-sm font-bold text-rose-800 dark:text-rose-200">
          &ldquo;{myth}&rdquo;
        </p>
      </div>

      {/* Reveal button */}
      {!revealed && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-3 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-xs font-bold text-white hover:from-rose-600 hover:to-pink-600 active:scale-[0.98] transition-all shadow-sm"
        >
          {revealButtonText}
        </button>
      )}

      {/* Fact reveal */}
      {revealed && (
        <div className="mt-3 space-y-3">
          {/* Verdict */}
          <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950">
            <p className="text-2xl" aria-hidden="true"></p>
            <p className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">
              {verdictText}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">
              {fact}
            </p>
          </div>

          {/* Source */}
          {source && (
            <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
              <p className="text-[10px] text-text-tertiary dark:text-gray-500">
                {sourcePrefix}
                {source}
              </p>
            </div>
          )}

          {/* Next myth */}
          {onNextMyth && (
            <button
              type="button"
              onClick={() => {
                setRevealed(false);
                onNextMyth();
              }}
              className="w-full rounded-xl border border-rose-200 bg-white py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:bg-gray-800 dark:text-rose-400"
            >
              {nextMythText}
            </button>
          )}

          {/* Knowledge tip */}
          <p className="text-center text-[9px] text-text-tertiary dark:text-gray-500">
            {footerText}
          </p>
        </div>
      )}
    </div>
  );
}
