'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Mentor Request Card — request a "Big Sister" mentor in beauty.
 * From Phase W4: Sisterhood & Community — Mentor-Mentee Program.
 *
 * Usage:
 *   <BeautyMentorRequestCard
 *     interests={['مكياج', 'عناية بالبشرة']}
 *     onRequest={() => {}}
 *   />
 */

interface BeautyMentorRequestCardProps {
  interests: string[];
  onRequest?: () => void;
  className?: string;
}

export function BeautyMentorRequestCard({
  interests,
  onRequest,
  className = '',
}: BeautyMentorRequestCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-5 dark:border-purple-900 dark:from-purple-950 dark:to-pink-950',
        className,
      )}
    >
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-pink-200 text-3xl dark:from-purple-800 dark:to-pink-800">
          
        </div>
        <h4 className="mt-2 text-sm font-bold text-purple-800 dark:text-purple-200">أخت كبيرة</h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">
          خبيرة ترشدكِ في رحلتكِ الجمالية
        </p>
      </div>

      {/* Interests */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300"> اهتماماتكِ</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* What mentor does */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
          ‍ ماذا تقدم لكِ الأخت الكبيرة؟
        </p>
        <div className="mt-1 space-y-0.5 text-[10px] text-purple-600 dark:text-purple-400">
          <p>• جلسة أسبوعية مباشرة</p>
          <p>• نصائح مخصصة لبشرتكِ</p>
          <p>• تعليم تقنيات المكياج</p>
          <p>• دعم وتشجيع مستمر</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRequest}
        className="mt-3 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
      >
        اطلبي أختكِ الكبيرة 
      </button>

      <p className="mt-2 text-center text-[9px] text-purple-500 dark:text-purple-400">
         مجتمع يقوم على الدعم — يداً بيد
      </p>
    </div>
  );
}
