'use client';

import { cn } from '@galaxy/shared';

interface BeautySmileCardProps {
  className?: string;
}

export function BeautySmileCard({ className = '' }: BeautySmileCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-4xl">😊</span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">قوة الابتسامة</h4>
        <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
          الابتسامة هي أجمل ما ترتدينه. ترفع هرمونات السعادة وتجعل بشرتكِ تتوهج.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <p className="text-lg">😊</p>
            <p className="text-[9px] text-amber-700 dark:text-amber-300">سعادة</p>
          </div>
          <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <p className="text-lg">💖</p>
            <p className="text-[9px] text-amber-700 dark:text-amber-300">ثقة</p>
          </div>
          <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <p className="text-lg">✨</p>
            <p className="text-[9px] text-amber-700 dark:text-amber-300">جاذبية</p>
          </div>
        </div>
      </div>
    </div>
  );
}
