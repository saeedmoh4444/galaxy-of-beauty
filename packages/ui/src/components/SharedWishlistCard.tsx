'use client';

import { cn } from '@galaxy/shared';

/**
 * Shared Wishlist Card — beauty wishlist you can share with friends & family.
 * From Phase W4: Sisterhood & Community — Beauty Circles.
 *
 * Usage:
 *   <SharedWishlistCard
 *     items={[{ name: 'مانيكير سبا', price: 150, emoji: '' }]}
 *     sharedWith={['نورة', 'أمي']}
 *   />
 */

interface WishlistItem {
  name: string;
  price: number;
  emoji?: string;
  isGifted?: boolean;
}

interface SharedWishlistCardProps {
  items: WishlistItem[];
  sharedWith: string[];
  onAddItem?: () => void;
  title?: string;
  wishesCountText?: string;
  giftedText?: string;
  currencySuffix?: string;
  totalLabel?: string;
  sharedWithLabel?: string;
  addItemText?: string;
  footerText?: string;
  className?: string;
}

export function SharedWishlistCard({
  items,
  sharedWith,
  onAddItem,
  className = '',
  title = 'قائمة أمنياتي',
  wishesCountText = ' أمنية · ',
  giftedText = 'مُهداة',
  currencySuffix = 'ر.س',
  totalLabel = ' المجموع',
  sharedWithLabel = '‍️ مشاركة مع',
  addItemText = '+ أضيفي أمنية',
  footerText = 'شاركي أمنياتكِ — ودعي أحبابكِ يدللونكِ',
}: SharedWishlistCardProps): JSX.Element {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const gifted = items.filter((i) => i.isGifted).length;

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true"></span>
          <div>
            <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
            <p className="text-[10px] text-pink-500 dark:text-pink-400">
              {items.length}
              {wishesCountText}
              {gifted > 0 && `${gifted} ${giftedText}`}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-3 space-y-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2',
              item.isGifted ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-gray-50 dark:bg-gray-800',
            )}
          >
            <span className="text-sm shrink-0" aria-hidden="true">
              {item.isGifted ? '' : item.emoji || ''}
            </span>
            <span className="flex-1 text-[10px] font-medium text-text-primary dark:text-gray-100">
              {item.name}
            </span>
            <span
              className={cn(
                'text-[10px] font-bold',
                item.isGifted
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-pink-600 dark:text-pink-400',
              )}
            >
              {item.isGifted ? '' : `${item.price} ${currencySuffix}`}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-2 flex items-center justify-between rounded-lg bg-pink-50 px-3 py-2 dark:bg-pink-950">
        <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300">{totalLabel}</span>
        <span className="text-xs font-bold text-pink-800 dark:text-pink-200">
          {total} {currencySuffix}
        </span>
      </div>

      {/* Shared with */}
      <div className="mt-2">
        <span className="text-[10px] text-text-tertiary dark:text-gray-500">{sharedWithLabel}</span>
        <div className="mt-1 flex flex-wrap gap-1">
          {sharedWith.map((name) => (
            <span
              key={name}
              className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-700 dark:bg-pink-950 dark:text-pink-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onAddItem}
        className="mt-3 w-full rounded-xl border border-dashed border-pink-300 py-2 text-[10px] font-bold text-pink-600 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-400 dark:hover:bg-pink-950 transition-colors"
      >
        {addItemText}
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
