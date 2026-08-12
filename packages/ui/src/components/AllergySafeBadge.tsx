'use client';

import { cn } from '@galaxy/shared';

/**
 * Allergy Safe Badge — hypoallergenic product options for sensitive skin.
 * From Phase W3: Health & Wellness Integration.
 *
 * Usage:
 *   <AllergySafeBadge allergies={['fragrance', 'nuts', 'dairy', 'gluten']} />
 */

type Allergy =
  'fragrance' | 'nuts' | 'dairy' | 'gluten' | 'paraben' | 'sulfate' | 'alcohol' | 'essential_oils';

interface AllergyDef {
  emoji: string;
  label: string;
}

const ALLERGIES: Record<Allergy, AllergyDef> = {
  fragrance: { emoji: '', label: 'عطور' },
  nuts: { emoji: '', label: 'مكسرات' },
  dairy: { emoji: '', label: 'ألبان' },
  gluten: { emoji: '', label: 'جلوتين' },
  paraben: { emoji: '', label: 'بارابين' },
  sulfate: { emoji: '🫧', label: 'سلفات' },
  alcohol: { emoji: '', label: 'كحول' },
  essential_oils: { emoji: '🫒', label: 'زيوت عطرية' },
};

interface AllergySafeBadgeProps {
  allergies: Allergy[];
  className?: string;
}

export function AllergySafeBadge({
  allergies,
  className = '',
}: AllergySafeBadgeProps): JSX.Element | null {
  if (!allergies.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          ️
        </span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            خالٍ من مسببات الحساسية
          </h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
            منتجات آمنة للبشرة الحساسة — خالية من
          </p>
        </div>
      </div>

      {/* Allergy chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {allergies.map((a) => {
          const def = ALLERGIES[a];
          return (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {def.emoji} {def.label}
            </span>
          );
        })}
      </div>

      {/* How we handle */}
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
           كيف نضمن سلامتكِ
        </p>
        <div className="mt-1 space-y-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
          <p>• نسألكِ عن الحساسية عند الحجز</p>
          <p>• نستخدم منتجات منفصلة ومعقمة</p>
          <p>• اختبار رقعة قبل أي منتج جديد</p>
          <p>• فريق مدرب على التعامل مع الحساسية</p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        🩺 أخبرينا عن حساسيتكِ عند الحجز — سلامتكِ تهمنا
      </p>
    </div>
  );
}
