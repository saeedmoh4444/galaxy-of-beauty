'use client';

import { cn } from '@galaxy/shared';

/**
 * Skin Analysis Card — AI-powered skin analysis & recommendations.
 * From Phase W3: Health & Wellness Integration.
 *
 * Usage:
 *   <SkinAnalysisCard concerns={['dryness', 'dark_spots']} />
 */

type SkinConcern =
  | 'dryness'
  | 'dark_spots'
  | 'acne'
  | 'wrinkles'
  | 'redness'
  | 'large_pores'
  | 'dullness'
  | 'oiliness';

interface ConcernDef {
  emoji: string;
  label: string;
  recommendation: string;
}

const CONCERNS: Record<SkinConcern, ConcernDef> = {
  dryness: {
    emoji: '️',
    label: 'جفاف',
    recommendation: 'سيروم هيالورونيك أسيد + مرطب غني بالسيراميد',
  },
  dark_spots: {
    emoji: '',
    label: 'تصبغات',
    recommendation: 'فيتامين سي صباحاً + نياسيناميد مساءً + واقي شمس',
  },
  acne: {
    emoji: '',
    label: 'حبوب',
    recommendation: 'حمض الساليسيليك + نياسيناميد + مرطب خالٍ من الزيوت',
  },
  wrinkles: {
    emoji: '',
    label: 'تجاعيد',
    recommendation: 'ريتينول مساءً + ببتيدات + واقي شمس يومي',
  },
  redness: { emoji: '', label: 'احمرار', recommendation: 'سيراميد + أزيلينك أسيد + مرطب مهدئ' },
  large_pores: {
    emoji: '',
    label: 'مسام واسعة',
    recommendation: 'نياسيناميد + مقشر كيميائي لطيف أسبوعياً',
  },
  dullness: {
    emoji: '',
    label: 'بهتان',
    recommendation: 'مقشر إنزيمي + فيتامين سي + ترطيب عميق',
  },
  oiliness: {
    emoji: '',
    label: 'دهون زائدة',
    recommendation: 'نياسيناميد + تونر خالٍ من الكحول + مرطب جل',
  },
};

interface SkinAnalysisCardProps {
  concerns: SkinConcern[];
  onBookConsultation?: () => void;
  className?: string;
}

export function SkinAnalysisCard({
  concerns,
  onBookConsultation,
  className = '',
}: SkinAnalysisCardProps): JSX.Element | null {
  if (!concerns.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-5 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          
        </span>
        <h4 className="mt-1 text-sm font-bold text-blue-700 dark:text-blue-300">تحليل البشرة</h4>
        <p className="text-[10px] text-blue-500 dark:text-blue-400">
          تحليل ذكي لبشرتكِ مع توصيات مخصصة
        </p>
      </div>

      {/* Concerns */}
      <div className="mt-3 space-y-2">
        {concerns.map((concern) => {
          const c = CONCERNS[concern];
          return (
            <div key={concern} className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  {c.emoji}
                </span>
                <span className="text-xs font-bold text-blue-800 dark:text-blue-200">
                  {c.label}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-blue-700 dark:text-blue-300">
                 {c.recommendation}
              </p>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
        <p className="text-center text-[10px] text-amber-700 dark:text-amber-300">
           هذا التحليل مبدئي بالذكاء الاصطناعي — استشيري طبيبة جلدية للتشخيص الدقيق
        </p>
      </div>

      <button
        type="button"
        onClick={onBookConsultation}
        className="mt-3 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        احجزي استشارة جلدية 🩺
      </button>
    </div>
  );
}
