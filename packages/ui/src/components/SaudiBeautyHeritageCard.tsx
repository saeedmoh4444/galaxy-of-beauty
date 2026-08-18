'use client';

import { cn } from '@galaxy/shared';

/**
 * Saudi Beauty Heritage Card — traditional Saudi beauty practices documented & preserved.
 * From Phase W6: Education & Empowerment — Saudi Beauty Heritage.
 *
 * Usage:
 *   <SaudiBeautyHeritageCard practice="henna" />
 */

type HeritagePractice =
  'henna' | 'kohl' | 'rose_water' | 'saffron' | 'musk' | 'amber' | 'sidr' | 'clove_oil';

interface PracticeDef {
  emoji: string;
  title: { ar: string; en: string };
  origin: { ar: string; en: string };
  description: { ar: string; en: string };
  modernUse: { ar: string; en: string };
}

const PRACTICES: Record<HeritagePractice, PracticeDef> = {
  henna: {
    emoji: '',
    title: { ar: 'الحناء', en: 'Henna' },
    origin: { ar: 'الجزيرة العربية — 5000 سنة', en: 'Arabian Peninsula — 5000 years' },
    description: {
      ar: 'استخدمت للتزيين والتبريد والعلاج. نقشات سعودية أصيلة تختلف من منطقة لأخرى.',
      en: 'Used for adornment, cooling and healing. Authentic Saudi patterns differ from region to region.',
    },
    modernUse: {
      ar: 'حناء طبيعية مع زيوت عطرية للعناية بالشعر ونقش الأيدي',
      en: 'Natural henna with scented oils for hair care and hand art',
    },
  },
  kohl: {
    emoji: '️',
    title: { ar: 'الكحل العربي', en: 'Arabian kohl' },
    origin: { ar: 'شبه الجزيرة العربية — 7000 سنة', en: 'Arabian Peninsula — 7000 years' },
    description: {
      ar: 'كان يستخدم لحماية العينين من الرمال والشمس، وكمضاد للبكتيريا.',
      en: 'Used to protect the eyes from sand and sun, and as an antibacterial.',
    },
    modernUse: {
      ar: 'كحل طبيعي من الإثمد النقي — آمن ومعقم',
      en: 'Natural kohl from pure stibnite — safe and sterile',
    },
  },
  rose_water: {
    emoji: '',
    title: { ar: 'ماء الورد الطائفي', en: 'Taif rose water' },
    origin: { ar: 'الطائف — 500 سنة', en: 'Taif — 500 years' },
    description: {
      ar: 'يقطر من ورود الطائف الشهيرة. استخدم كتونر ومنعش ومنظف للبشرة.',
      en: 'Distilled from the famous Taif roses. Used as a toner, refresher and cleanser.',
    },
    modernUse: {
      ar: 'تونر طبيعي للبشرة ومعطر جو فاخر',
      en: 'Natural skin toner and luxurious air freshener',
    },
  },
  saffron: {
    emoji: '',
    title: { ar: 'الزعفران', en: 'Saffron' },
    origin: { ar: 'طرق التجارة القديمة — 3000 سنة', en: 'Ancient trade routes — 3000 years' },
    description: {
      ar: 'استخدمته النساء السعوديات لتفتيح البشرة وإشراقتها في المناسبات.',
      en: 'Used by Saudi women to brighten and glow their skin for occasions.',
    },
    modernUse: {
      ar: 'ماسكات الزعفران للوجه — تفتيح وإشراقة طبيعية',
      en: 'Saffron face masks — natural brightening and glow',
    },
  },
  musk: {
    emoji: '',
    title: { ar: 'المسك', en: 'Musk' },
    origin: { ar: 'طرق البخور العربية — 2000 سنة', en: 'Arabian incense routes — 2000 years' },
    description: {
      ar: 'أغلى العطور. كانت النساء تخلطه مع الزيوت للتعطير الدائم.',
      en: 'The most precious fragrance. Women blended it with oils for lasting scent.',
    },
    modernUse: {
      ar: 'عطور زيتية تدوم طويلاً — بديل طبيعي للعطور الكحولية',
      en: 'Long-lasting oil perfumes — a natural alternative to alcohol-based ones',
    },
  },
  amber: {
    emoji: '',
    title: { ar: 'العنبر', en: 'Amber' },
    origin: { ar: 'المحيط — آلاف السنين', en: 'The ocean — thousands of years' },
    description: {
      ar: 'مادة ثمينة تستخدم في العطور الشرقية الفاخرة منذ قرون.',
      en: 'A precious substance used in luxury oriental perfumes for centuries.',
    },
    modernUse: {
      ar: 'مكون أساسي في العطور الشرقية الفاخرة',
      en: 'A core ingredient in luxury oriental perfumes',
    },
  },
  sidr: {
    emoji: '',
    title: { ar: 'السدر', en: 'Sidr' },
    origin: { ar: 'الجزيرة العربية — قديم', en: 'Arabian Peninsula — ancient' },
    description: {
      ar: 'ورق السدر يستخدم لغسل الشعر وتقويته وتنعيمه منذ آلاف السنين.',
      en: 'Sidr leaves used for washing, strengthening and softening hair for thousands of years.',
    },
    modernUse: {
      ar: 'شامبو طبيعي من ورق السدر — يقوي الشعر ويمنع التساقط',
      en: 'Natural shampoo from sidr leaves — strengthens hair and prevents fall',
    },
  },
  clove_oil: {
    emoji: '',
    title: { ar: 'زيت القرنفل', en: 'Clove oil' },
    origin: { ar: 'طرق التوابل — 2000 سنة', en: 'Spice routes — 2000 years' },
    description: {
      ar: 'استخدمته النساء لألم الأسنان وتعطير الفم وتطهير البشرة.',
      en: 'Used by women for toothache, breath freshening and skin cleansing.',
    },
    modernUse: {
      ar: 'علاج طبيعي لحبوب البشرة — مضاد للبكتيريا',
      en: 'Natural treatment for skin blemishes — antibacterial',
    },
  },
};

interface SaudiBeautyHeritageCardProps {
  practice: HeritagePractice;
  className?: string;
  /** Label for the history section */
  historyLabel?: string;
  /** Label for the modern use section */
  modernUseLabel?: string;
  /** Heritage badge note */
  heritageNote?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal practice data strings */
  locale?: 'ar' | 'en';
}

export function SaudiBeautyHeritageCard({
  practice,
  className = '',
  historyLabel = ' التاريخ',
  modernUseLabel = 'الاستخدام الحديث',
  heritageNote = 'هذا المحتوى يوثق تراث الجمال السعودي الأصيل',
  footerText = 'نحافظ على تراثنا — لأنه جزء من هويتنا',
  locale = 'ar',
}: SaudiBeautyHeritageCardProps): JSX.Element {
  const p = PRACTICES[practice];

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          {p.emoji}
        </span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">
          {p.title[locale]}
        </h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400"> {p.origin[locale]}</p>
      </div>

      {/* History */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">{historyLabel}</p>
        <p className="mt-1 text-[10px] leading-relaxed text-amber-700 dark:text-amber-300">
          {p.description[locale]}
        </p>
      </div>

      {/* Modern use */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">{modernUseLabel}</p>
        <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-300">{p.modernUse[locale]}</p>
      </div>

      {/* Heritage badge */}
      <div className="mt-2 rounded-lg bg-amber-100 p-2 text-center dark:bg-amber-900">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">{heritageNote}</p>
      </div>

      <p className="mt-1.5 text-center text-[9px] text-amber-600 dark:text-amber-400">
        {footerText}
      </p>
    </div>
  );
}
