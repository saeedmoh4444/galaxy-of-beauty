'use client';

import { cn } from '@galaxy/shared';

/**
 * Skin Analysis Card — AI-powered skin analysis & recommendations.
 * From Phase W3: Health & Wellness Integration.
 *
 * Usage:
 *   <SkinAnalysisCard concerns={['dryness', 'dark_spots']} />
 */

export type SkinConcern =
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
  label: { ar: string; en: string };
  recommendation: { ar: string; en: string };
}

const CONCERNS: Record<SkinConcern, ConcernDef> = {
  dryness: {
    emoji: '️',
    label: { ar: 'جفاف', en: 'Dryness' },
    recommendation: {
      ar: 'سيروم هيالورونيك أسيد + مرطب غني بالسيراميد',
      en: 'Hyaluronic acid serum + a moisturizer rich in ceramides',
    },
  },
  dark_spots: {
    emoji: '',
    label: { ar: 'تصبغات', en: 'Dark spots' },
    recommendation: {
      ar: 'فيتامين سي صباحاً + نياسيناميد مساءً + واقي شمس',
      en: 'Vitamin C in the morning + niacinamide at night + sunscreen',
    },
  },
  acne: {
    emoji: '',
    label: { ar: 'حبوب', en: 'Acne' },
    recommendation: {
      ar: 'حمض الساليسيليك + نياسيناميد + مرطب خالٍ من الزيوت',
      en: 'Salicylic acid + niacinamide + an oil-free moisturizer',
    },
  },
  wrinkles: {
    emoji: '',
    label: { ar: 'تجاعيد', en: 'Wrinkles' },
    recommendation: {
      ar: 'ريتينول مساءً + ببتيدات + واقي شمس يومي',
      en: 'Retinol at night + peptides + daily sunscreen',
    },
  },
  redness: {
    emoji: '',
    label: { ar: 'احمرار', en: 'Redness' },
    recommendation: {
      ar: 'سيراميد + أزيلينك أسيد + مرطب مهدئ',
      en: 'Ceramides + azelaic acid + a soothing moisturizer',
    },
  },
  large_pores: {
    emoji: '',
    label: { ar: 'مسام واسعة', en: 'Large pores' },
    recommendation: {
      ar: 'نياسيناميد + مقشر كيميائي لطيف أسبوعياً',
      en: 'Niacinamide + a gentle weekly chemical exfoliant',
    },
  },
  dullness: {
    emoji: '',
    label: { ar: 'بهتان', en: 'Dullness' },
    recommendation: {
      ar: 'مقشر إنزيمي + فيتامين سي + ترطيب عميق',
      en: 'Enzyme exfoliant + vitamin C + deep hydration',
    },
  },
  oiliness: {
    emoji: '',
    label: { ar: 'دهون زائدة', en: 'Excess oil' },
    recommendation: {
      ar: 'نياسيناميد + تونر خالٍ من الكحول + مرطب جل',
      en: 'Niacinamide + an alcohol-free toner + a gel moisturizer',
    },
  },
};

interface SkinAnalysisCardProps {
  concerns: SkinConcern[];
  onBookConsultation?: () => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Disclaimer text */
  disclaimerText?: string;
  /** Consultation button label */
  consultationLabel?: string;
  /** Locale for internal concern data strings */
  locale?: 'ar' | 'en';
}

export function SkinAnalysisCard({
  concerns,
  onBookConsultation,
  className = '',
  title = 'تحليل البشرة',
  subtitle = 'تحليل ذكي لبشرتكِ مع توصيات مخصصة',
  disclaimerText = 'هذا التحليل مبدئي بالذكاء الاصطناعي — استشيري طبيبة جلدية للتشخيص الدقيق',
  consultationLabel = 'احجزي استشارة جلدية 🩺',
  locale = 'ar',
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
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-blue-700 dark:text-blue-300">{title}</h4>
        <p className="text-[10px] text-blue-500 dark:text-blue-400">{subtitle}</p>
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
                  {c.label[locale]}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-blue-700 dark:text-blue-300">
                {c.recommendation[locale]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
        <p className="text-center text-[10px] text-amber-700 dark:text-amber-300">
          {disclaimerText}
        </p>
      </div>

      <button
        type="button"
        onClick={onBookConsultation}
        className="mt-3 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        {consultationLabel}
      </button>
    </div>
  );
}
