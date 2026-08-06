'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Technician Quote Card — inspirational quotes from platform technicians.
 * From Phase W10: Saudi Women Leadership.
 *
 * Usage:
 *   <BeautyTechnicianQuoteCard quote={{ text: 'الجمال يبدأ من الثقة بالنفس', author: 'نورة', role: 'خبيرة مكياج' }} />
 */

interface TechnicianQuote {
  text: string;
  author: string;
  role: string;
  emoji?: string;
}

interface BeautyTechnicianQuoteCardProps {
  quote: TechnicianQuote;
  onNextQuote?: () => void;
  className?: string;
}

export function BeautyTechnicianQuoteCard({ quote, onNextQuote, className = '' }: BeautyTechnicianQuoteCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950', className)}>
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0" aria-hidden="true">{quote.emoji || '💬'}</span>
        <div>
          <p className="text-sm leading-relaxed italic text-amber-800 dark:text-amber-200">
            &ldquo;{quote.text}&rdquo;
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-sm">👩‍🎨</div>
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300">{quote.author}</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400">{quote.role}</p>
            </div>
          </div>
        </div>
      </div>
      {onNextQuote && (
        <button type="button" onClick={onNextQuote} className="mt-3 w-full rounded-lg border border-amber-200 py-1.5 text-[10px] font-bold text-amber-700 hover:bg-white/60 dark:border-amber-800 dark:text-amber-300 transition-colors">
          اقتباس آخر ←
        </button>
      )}
    </div>
  );
}
