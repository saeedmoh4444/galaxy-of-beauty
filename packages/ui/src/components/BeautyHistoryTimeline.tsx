'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty History Timeline — history of beauty through the ages.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyHistoryTimeline />
 */

interface HistoryEra {
  era: { ar: string; en: string };
  emoji: string;
  year: { ar: string; en: string };
  fact: { ar: string; en: string };
}

const ERAS: HistoryEra[] = [
  {
    era: { ar: 'مصر القديمة', en: 'Ancient Egypt' },
    emoji: '️',
    year: { ar: '3000 ق.م', en: '3000 BC' },
    fact: {
      ar: 'كليوباترا استخدمت الحليب والعسل للاستحمام — وزيت الخروع للكحل',
      en: 'Cleopatra bathed in milk and honey — and used castor oil for kohl',
    },
  },
  {
    era: { ar: 'اليونان القديمة', en: 'Ancient Greece' },
    emoji: '️',
    year: { ar: '500 ق.م', en: '500 BC' },
    fact: {
      ar: 'استخدموا زيت الزيتون للترطيب والرصاص الأبيض لتفتيح البشرة',
      en: 'They used olive oil for hydration and white lead to lighten the skin',
    },
  },
  {
    era: { ar: 'الجزيرة العربية', en: 'Arabian Peninsula' },
    emoji: '',
    year: { ar: '2000 ق.م', en: '2000 BC' },
    fact: {
      ar: 'الحناء استخدمت للتزيين والتبريد — ونقشاتها تروي قصص القبائل',
      en: 'Henna was used for adornment and cooling — its patterns tell tribal stories',
    },
  },
  {
    era: { ar: 'العصر العباسي', en: 'Abbasid era' },
    emoji: '',
    year: { ar: '800 م', en: '800 AD' },
    fact: {
      ar: 'زرياب الأندلسي أدخل روتين العناية بالشعر والبشرة للنساء',
      en: 'Ziryab of Andalusia introduced hair and skincare routines for women',
    },
  },
  {
    era: { ar: 'أوروبا الفيكتورية', en: 'Victorian Europe' },
    emoji: '',
    year: { ar: '1850 م', en: '1850 AD' },
    fact: {
      ar: 'البشرة البيضاء رمز الثراء — والنساء تجنبن الشمس تماماً',
      en: 'Pale skin was a symbol of wealth — women avoided the sun entirely',
    },
  },
  {
    era: { ar: 'العصر الذهبي', en: 'The Golden Age' },
    emoji: '',
    year: { ar: '1950 م', en: '1950 AD' },
    fact: {
      ar: 'مارلين مونرو جعلت الشامة والشعر الأشقر موضة عالمية',
      en: 'Marilyn Monroe made beauty marks and blonde hair a global trend',
    },
  },
  {
    era: { ar: 'الثمانينات', en: 'The 80s' },
    emoji: '',
    year: { ar: '1980 م', en: '1980 AD' },
    fact: {
      ar: 'الألوان الجريئة والمكياج الثقيل — عصر الإفراط في كل شيء',
      en: 'Bold colors and heavy makeup — the era of excess in everything',
    },
  },
  {
    era: { ar: 'اليوم', en: 'Today' },
    emoji: '',
    year: { ar: '2026 م', en: '2026 AD' },
    fact: {
      ar: 'الجمال الطبيعي والعناية بالبشرة — والأهم: الجمال للجميع',
      en: 'Natural beauty and skincare — and most importantly: beauty for everyone',
    },
  },
];

interface BeautyHistoryTimelineProps {
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal era data strings */
  locale?: 'ar' | 'en';
}

export function BeautyHistoryTimeline({
  className = '',
  title = 'تاريخ الجمال',
  subtitle = 'رحلة الجمال عبر العصور',
  footerText = '"الجمال قصة قديمة — وما زلنا نكتب فصولها"',
  locale = 'ar',
}: BeautyHistoryTimelineProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl bg-white p-5 dark:bg-gray-900', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
        <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
      </div>

      <div className="mt-4">
        {ERAS.map((era, i) => (
          <div key={era.era.ar} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-50 text-sm dark:border-amber-800 dark:bg-amber-950">
                {era.emoji}
              </div>
              {i < ERAS.length - 1 && (
                <div className="h-full min-h-[16px] w-0.5 bg-amber-200 dark:bg-amber-800" />
              )}
            </div>
            <div className="pb-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                  {era.era[locale]}
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  {era.year[locale]}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] leading-relaxed text-text-secondary dark:text-gray-300">
                {era.fact[locale]}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">{footerText}</p>
    </div>
  );
}
