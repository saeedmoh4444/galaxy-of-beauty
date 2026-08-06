'use client';

import { cn } from '@galaxy/shared';

/**
 * Baby Shower Card — beauty packages for baby showers & gender reveals.
 * From Phase W7: Mother-Daughter & Family.
 *
 * Usage:
 *   <BabyShowerCard momName="نورة" onBook={() => {}} />
 */

interface BabyShowerCardProps {
  momName: string;
  guests?: number;
  onBook?: () => void;
  className?: string;
}

export function BabyShowerCard({ momName: _momName, guests, onBook, className = '' }: BabyShowerCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-pink-50 p-5 dark:border-sky-900 dark:from-sky-950 dark:to-pink-950', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">👶</span>
        <h4 className="mt-1 text-sm font-bold text-sky-800 dark:text-sky-200">بيبي شاور</h4>
        <p className="text-[10px] text-sky-500 dark:text-sky-400">إطلالة مميزة للأم المنتظرة</p>
        {guests && <p className="mt-0.5 text-[10px] text-text-tertiary dark:text-gray-500">{guests} ضيفة</p>}
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-sky-800 dark:text-sky-200">🎀 تشمل الباقة</p>
        <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-sky-700 dark:text-sky-300">
          <span>• مكياج ناعم</span><span>• تسريحة</span>
          <span>• مانيكير</span><span>• تنسيق ديكور</span>
          <span>• كيكة</span><span>• هدايا</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">تبدأ من</p>
          <p className="text-lg font-bold text-sky-800 dark:text-sky-200">500 ر.س</p>
        </div>
        <button type="button" onClick={onBook} className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-700 active:scale-[0.98] transition-all">احجزي 💙</button>
      </div>
    </div>
  );
}
