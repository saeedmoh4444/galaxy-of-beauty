'use client';

import { cn } from '@galaxy/shared';

/**
 * Breast Health Card — breast self-exam reminder & awareness.
 * From Phase W3: Health & Wellness — Women's Health Awareness (W10 Social Impact).
 *
 * Usage:
 *   <BreastHealthCard lastExam="2026-07" />
 */

interface BreastHealthCardProps {
  lastExam?: string;
  nextReminder?: string;
  onLearnMore?: () => void;
  className?: string;
}

export function BreastHealthCard({ lastExam, nextReminder, onLearnMore, className = '' }: BreastHealthCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-rose-950', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">🎀</span>
        <h4 className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">صحتكِ تهمنا</h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">تذكير شهري بالفحص الذاتي</p>
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300">🎀 الفحص الذاتي للثدي</p>
        <div className="mt-2 space-y-1 text-[10px] text-pink-600 dark:text-pink-400">
          <p>• مرة شهرياً — بعد انتهاء الدورة</p>
          <p>• 5 دقائق فقط قد تنقذ حياتكِ</p>
          <p>• الكشف المبكر = شفاء 98%</p>
        </div>
      </div>

      {lastExam && (
        <div className="mt-2 rounded-lg bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[10px] text-pink-700 dark:text-pink-300">📅 آخر فحص: {lastExam}</p>
        </div>
      )}
      {nextReminder && (
        <div className="mt-1 rounded-lg bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[10px] text-pink-700 dark:text-pink-300">⏰ التذكير القادم: {nextReminder}</p>
        </div>
      )}

      <button type="button" onClick={onLearnMore} className="mt-3 w-full rounded-xl bg-pink-600 py-2.5 text-xs font-bold text-white hover:bg-pink-700 active:scale-[0.98] transition-all">
        تعلمي طريقة الفحص 🎀
      </button>

      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">🎀 صحتكِ أغلى ما تملكين</p>
    </div>
  );
}
