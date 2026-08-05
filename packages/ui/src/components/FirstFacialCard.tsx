'use client';

import { cn } from '@galaxy/shared';

/**
 * First Facial Card — gentle introduction to skincare for young teens.
 * From Phase W7: Mother-Daughter & Family — Girls' First Beauty.
 *
 * Usage:
 *   <FirstFacialCard age={13} momName="نورة" onBook={() => {}} />
 */

interface FirstFacialCardProps {
  age: number;
  momName?: string;
  skinType?: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  onBook?: () => void;
  className?: string;
}

const SKIN_TIPS: Record<string, string> = {
  oily: 'بشرتكِ دهنية — سنستخدم منتجات خفيفة خالية من الزيوت',
  dry: 'بشرتكِ جافة — سنركز على الترطيب العميق',
  combination: 'بشرتكِ مختلطة — سنستخدم منتجات متوازنة',
  sensitive: 'بشرتكِ حساسة — سنستخدم منتجات لطيفة ومهدئة',
  normal: 'بشرتكِ طبيعية — سنستخدم منتجات لطيفة للحفاظ على توازنها',
};

export function FirstFacialCard({
  age,
  momName,
  skinType,
  onBook,
  className = '',
}: FirstFacialCardProps): JSX.Element {
  const isAgeAppropriate = age >= 10 && age <= 17;
  const tip = skinType ? SKIN_TIPS[skinType] : null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-5 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">🌸</span>
        <h4 className="mt-1 text-sm font-bold text-pink-700 dark:text-pink-300">
          أول عناية بالبشرة
        </h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">
          تجربة لطيفة وممتعة لأول مرة
        </p>
        {!isAgeAppropriate && (
          <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
            ⚠️ مناسب للأعمار 10-17 سنة
          </p>
        )}
      </div>

      {/* What we'll do */}
      <div className="mt-3 rounded-xl bg-pink-50 p-3 dark:bg-pink-950">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300">
          ✨ ماذا سنفعل
        </p>
        <div className="mt-1.5 space-y-1">
          {[
            { emoji: '🔍', text: 'تحليل بشرتكِ بلطف' },
            { emoji: '🧴', text: 'تنظيف لطيف بدون مواد قاسية' },
            { emoji: '💆‍♀️', text: 'تدليك خفيف للوجه (3 دقائق)' },
            { emoji: '💧', text: 'ترطيب وواقي شمس' },
            { emoji: '📝', text: 'نصائح للعناية اليومية' },
          ].map((s) => (
            <div key={s.text} className="flex items-center gap-1.5">
              <span aria-hidden="true">{s.emoji}</span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300">{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skin type tip */}
      {tip && (
        <div className="mt-2 rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
          <p className="text-[10px] text-blue-700 dark:text-blue-300">💡 {tip}</p>
        </div>
      )}

      {/* Mom section */}
      {momName && (
        <div className="mt-2 rounded-xl bg-purple-50 p-3 dark:bg-purple-950">
          <p className="text-center text-[10px] text-purple-700 dark:text-purple-300">
            👩‍👧 {momName} تستطيعين الحضور معها ومشاهدة التجربة
          </p>
        </div>
      )}

      {/* No heavy products pledge */}
      <div className="mt-2 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
        <p className="text-center text-[10px] text-emerald-700 dark:text-emerald-300">
          🌱 لا كريم أساس ثقيل · لا مقشرات قوية · منتجات آمنة فقط
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-pink-600 py-2.5 text-xs font-bold text-white hover:bg-pink-700 active:scale-[0.98] transition-all"
      >
        {momName ? 'احجزي مع أمكِ 🌸' : 'احجزي جلستكِ الأولى 🌸'}
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        🌸 بشرتكِ تستحق بداية لطيفة — العناية قبل التجميل
      </p>
    </div>
  );
}
