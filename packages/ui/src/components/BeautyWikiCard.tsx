'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Wiki Card — beauty encyclopedia entry from the Knowledge Hub.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyWikiCard entry={{ title: 'فيتامين سي', category: 'ingredient', excerpt: '...' }} />
 */

type WikiCategory =
  'ingredient' | 'skincare' | 'haircare' | 'makeup' | 'tradition' | 'myth' | 'health';

interface CategoryDef {
  emoji: string;
  label: string;
}

const CATEGORIES: Record<WikiCategory, CategoryDef> = {
  ingredient: { emoji: '🧪', label: 'مكونات' },
  skincare: { emoji: '🧴', label: 'عناية بالبشرة' },
  haircare: { emoji: '💇', label: 'عناية بالشعر' },
  makeup: { emoji: '💄', label: 'مكياج' },
  tradition: { emoji: '🏺', label: 'تراث سعودي' },
  myth: { emoji: '🔍', label: 'خرافات شائعة' },
  health: { emoji: '🩺', label: 'صحة' },
};

interface WikiEntry {
  title: string;
  category: WikiCategory;
  excerpt: string;
  /** Reading time in minutes */
  readTime?: number;
  /** Author */
  author?: string;
  /** Is verified by dermatologist */
  verified?: boolean;
  /** Arabic-first indicator */
  isArabicOriginal?: boolean;
}

interface BeautyWikiCardProps {
  entry: WikiEntry;
  onReadMore?: () => void;
  className?: string;
}

export function BeautyWikiCard({
  entry,
  onReadMore,
  className = '',
}: BeautyWikiCardProps): JSX.Element {
  const cat = CATEGORIES[entry.category];

  return (
    <div
      className={cn(
        'group rounded-2xl border border-teal-100 bg-white p-4 transition-shadow hover:shadow-md dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium',
            entry.category === 'tradition'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : entry.category === 'myth'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : entry.category === 'health'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
          )}
        >
          {cat.emoji} {cat.label}
        </span>

        {/* Verified badge */}
        {entry.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            🩺 موثوق طبياً
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="mt-2 text-sm font-bold text-text-primary dark:text-gray-100">{entry.title}</h4>

      {/* Excerpt */}
      <p className="mt-1 text-xs leading-relaxed text-text-secondary dark:text-gray-300 line-clamp-3">
        {entry.excerpt}
      </p>

      {/* Meta row */}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-text-tertiary dark:text-gray-500">
        {entry.readTime && (
          <span className="flex items-center gap-1">📖 {entry.readTime} دقائق قراءة</span>
        )}
        {entry.author && <span className="flex items-center gap-1">✍️ {entry.author}</span>}
        {entry.isArabicOriginal && (
          <span className="rounded bg-teal-50 px-1.5 py-0.5 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            🇸🇦 محتوى عربي أصلي
          </span>
        )}
      </div>

      {/* Read more CTA */}
      <button
        type="button"
        onClick={onReadMore}
        className="mt-3 w-full rounded-xl border border-teal-200 bg-teal-50 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300 dark:hover:bg-teal-900 transition-colors"
      >
        اقرئي المزيد ←
      </button>

      {/* Saudi Heritage badge for tradition entries */}
      {entry.category === 'tradition' && (
        <div className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-center dark:bg-amber-950">
          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
            🏺 هذا المحتوى يوثق تراث الجمال السعودي الأصيل
          </p>
        </div>
      )}

      {/* Myth buster badge */}
      {entry.category === 'myth' && (
        <div className="mt-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-center dark:bg-rose-950">
          <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
            🔍 هل تعتقدين أن معجون الأسنان يعالج الحبوب؟ اقرئي الحقيقة!
          </p>
        </div>
      )}
    </div>
  );
}
