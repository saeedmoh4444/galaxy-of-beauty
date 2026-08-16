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
  title: string;
  origin: string;
  description: string;
  modernUse: string;
}

const PRACTICES: Record<HeritagePractice, PracticeDef> = {
  henna: {
    emoji: '',
    title: 'الحناء',
    origin: 'الجزيرة العربية — 5000 سنة',
    description: 'استخدمت للتزيين والتبريد والعلاج. نقشات سعودية أصيلة تختلف من منطقة لأخرى.',
    modernUse: 'حناء طبيعية مع زيوت عطرية للعناية بالشعر ونقش الأيدي',
  },
  kohl: {
    emoji: '️',
    title: 'الكحل العربي',
    origin: 'شبه الجزيرة العربية — 7000 سنة',
    description: 'كان يستخدم لحماية العينين من الرمال والشمس، وكمضاد للبكتيريا.',
    modernUse: 'كحل طبيعي من الإثمد النقي — آمن ومعقم',
  },
  rose_water: {
    emoji: '',
    title: 'ماء الورد الطائفي',
    origin: 'الطائف — 500 سنة',
    description: 'يقطر من ورود الطائف الشهيرة. استخدم كتونر ومنعش ومنظف للبشرة.',
    modernUse: 'تونر طبيعي للبشرة ومعطر جو فاخر',
  },
  saffron: {
    emoji: '',
    title: 'الزعفران',
    origin: 'طرق التجارة القديمة — 3000 سنة',
    description: 'استخدمته النساء السعوديات لتفتيح البشرة وإشراقتها في المناسبات.',
    modernUse: 'ماسكات الزعفران للوجه — تفتيح وإشراقة طبيعية',
  },
  musk: {
    emoji: '',
    title: 'المسك',
    origin: 'طرق البخور العربية — 2000 سنة',
    description: 'أغلى العطور. كانت النساء تخلطه مع الزيوت للتعطير الدائم.',
    modernUse: 'عطور زيتية تدوم طويلاً — بديل طبيعي للعطور الكحولية',
  },
  amber: {
    emoji: '',
    title: 'العنبر',
    origin: 'المحيط — آلاف السنين',
    description: 'مادة ثمينة تستخدم في العطور الشرقية الفاخرة منذ قرون.',
    modernUse: 'مكون أساسي في العطور الشرقية الفاخرة',
  },
  sidr: {
    emoji: '',
    title: 'السدر',
    origin: 'الجزيرة العربية — قديم',
    description: 'ورق السدر يستخدم لغسل الشعر وتقويته وتنعيمه منذ آلاف السنين.',
    modernUse: 'شامبو طبيعي من ورق السدر — يقوي الشعر ويمنع التساقط',
  },
  clove_oil: {
    emoji: '',
    title: 'زيت القرنفل',
    origin: 'طرق التوابل — 2000 سنة',
    description: 'استخدمته النساء لألم الأسنان وتعطير الفم وتطهير البشرة.',
    modernUse: 'علاج طبيعي لحبوب البشرة — مضاد للبكتيريا',
  },
};

interface SaudiBeautyHeritageCardProps {
  practice: HeritagePractice;
  className?: string;
}

export function SaudiBeautyHeritageCard({
  practice,
  className = '',
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
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">{p.title}</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400"> {p.origin}</p>
      </div>

      {/* History */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200"> التاريخ</p>
        <p className="mt-1 text-[10px] leading-relaxed text-amber-700 dark:text-amber-300">
          {p.description}
        </p>
      </div>

      {/* Modern use */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">الاستخدام الحديث</p>
        <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-300">{p.modernUse}</p>
      </div>

      {/* Heritage badge */}
      <div className="mt-2 rounded-lg bg-amber-100 p-2 text-center dark:bg-amber-900">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">
          هذا المحتوى يوثق تراث الجمال السعودي الأصيل
        </p>
      </div>

      <p className="mt-1.5 text-center text-[9px] text-amber-600 dark:text-amber-400">
        نحافظ على تراثنا — لأنه جزء من هويتنا
      </p>
    </div>
  );
}
