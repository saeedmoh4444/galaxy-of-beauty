'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Book Club Card — reading group for beauty enthusiasts.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyBookClubCard
 *     book={{ title: 'أسرار الجمال العربي', author: 'د. نورة', members: 45 }}
 *   />
 */

interface BookClubBook {
  title: string;
  author: string;
  members: number;
  emoji?: string;
  currentChapter?: string;
  nextMeeting?: string;
}

interface BeautyBookClubCardProps {
  book: BookClubBook;
  onJoin?: () => void;
  className?: string;
}

export function BeautyBookClubCard({
  book,
  onJoin,
  className = '',
}: BeautyBookClubCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 text-2xl dark:from-amber-900 dark:to-yellow-900">
          {book.emoji || ''}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">نادي الكتاب</h4>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100 mt-0.5">
            {book.title}
          </p>
          <p className="text-[10px] text-text-tertiary dark:text-gray-500">️ {book.author}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-amber-50 p-2.5 text-center dark:bg-amber-950">
          <p className="text-[9px] text-amber-600 dark:text-amber-400">الأعضاء</p>
          <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{book.members}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-2.5 text-center dark:bg-amber-950">
          <p className="text-[9px] text-amber-600 dark:text-amber-400">الفصل الحالي</p>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-200 truncate">
            {book.currentChapter || 'قيد التحديد'}
          </p>
        </div>
      </div>

      {/* Next meeting */}
      {book.nextMeeting && (
        <div className="mt-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
          <p className="text-center text-[10px] text-amber-700 dark:text-amber-300">
             اللقاء القادم: {book.nextMeeting}
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onJoin}
        className="mt-3 w-full rounded-xl bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
      >
        انضمي للنادي 
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         نقرأ معاً لنرتقي معاً
      </p>
    </div>
  );
}
