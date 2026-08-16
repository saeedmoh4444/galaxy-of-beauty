'use client';

import { cn } from '@galaxy/shared';

/**
 * Galentine's Card — celebrate female friendship on February 13.
 * From Phase W7: Mother-Daughter & Family — Friends Who Slay Together.
 *
 * Usage:
 *   <GalentinesCard friends={['نورة', 'مها']} onBook={() => {}} />
 */

interface GalentinesCardProps {
  friends: string[];
  /** February 13 is the default */
  date?: string;
  /** Discount percentage for group booking */
  discount?: number;
  totalPrice?: number;
  onBook?: () => void;
  className?: string;
}

export function GalentinesCard({
  friends,
  date = '13 فبراير',
  discount = 20,
  totalPrice = 450,
  onBook,
  className = '',
}: GalentinesCardProps): JSX.Element {
  const pricePerPerson = Math.round(totalPrice / (friends.length + 1)); // +1 for the user

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-rose-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-rose-200 text-2xl dark:from-pink-800 dark:to-rose-800"></div>
        <h4 className="mt-2 text-sm font-bold text-pink-800 dark:text-pink-200">يوم الصديقات</h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">{date} — احتفلي بصداقاتكِ</p>
      </div>

      {/* Friend list */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
          معكِ في هذا اليوم
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-pink-100 px-2.5 py-1 text-[10px] font-bold text-pink-700 dark:bg-pink-900 dark:text-pink-300">
            أنتِ
          </span>
          {friends.map((name) => (
            <span
              key={name}
              className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-medium text-rose-700 dark:bg-rose-900 dark:text-rose-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* What's included */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300"> الباقة تشمل</p>
        <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-text-secondary dark:text-gray-300">
          <span>• مانيكير للجميع</span>
          <span>• ماسك وجه</span>
          <span>• شاي وحلويات</span>
          <span>• جلسة تصوير جماعية</span>
          <span>• هدية لكل صديقة</span>
          <span>• موسيقى وبالونات</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/60 p-2 dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">الإجمالي</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">{totalPrice} ر.س</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2 dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">للفرد</p>
          <p className="text-xs font-bold text-pink-700 dark:text-pink-400">{pricePerPerson} ر.س</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2 dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">الخصم</p>
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">-{discount}%</p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-xs font-bold text-white hover:from-pink-600 hover:to-rose-600 active:scale-[0.98] transition-all shadow-sm shadow-pink-200 dark:shadow-pink-900"
      >
        احجزي يوم الصديقات
      </button>

      {/* Footer */}
      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">
        لأن الصديقات هن العائلة التي نختارها
      </p>
    </div>
  );
}
