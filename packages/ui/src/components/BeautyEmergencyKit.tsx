'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Emergency Kit — essential items available in every salon bathroom.
 * From Phase W9: The Small Details — Thoughtful Touches.
 *
 * Usage:
 *   <BeautyEmergencyKit items={['pads', 'hair_spray', 'sewing_kit']} />
 */

type KitItem =
  | 'pads'
  | 'tampons'
  | 'hair_spray'
  | 'bobby_pins'
  | 'hair_tie'
  | 'deodorant'
  | 'sewing_kit'
  | 'stain_remover'
  | 'nail_file'
  | 'mints';

interface ItemDef {
  emoji: string;
  label: { ar: string; en: string };
}

const ITEMS: Record<KitItem, ItemDef> = {
  pads: { emoji: '🩹', label: { ar: 'فوط صحية', en: 'Sanitary pads' } },
  tampons: { emoji: '🩹', label: { ar: 'سدادات قطنية', en: 'Tampons' } },
  hair_spray: { emoji: '', label: { ar: 'مثبت شعر', en: 'Hairspray' } },
  bobby_pins: { emoji: '', label: { ar: 'دبابيس شعر', en: 'Bobby pins' } },
  hair_tie: { emoji: '', label: { ar: 'ربطة شعر', en: 'Hair tie' } },
  deodorant: { emoji: '', label: { ar: 'مزيل عرق', en: 'Deodorant' } },
  sewing_kit: { emoji: '🪡', label: { ar: 'عدة خياطة', en: 'Sewing kit' } },
  stain_remover: { emoji: '', label: { ar: 'مزيل بقع', en: 'Stain remover' } },
  nail_file: { emoji: '', label: { ar: 'مبرد أظافر', en: 'Nail file' } },
  mints: { emoji: '', label: { ar: 'منعش نفس', en: 'Breath mints' } },
};

interface BeautyEmergencyKitProps {
  items: KitItem[];
  className?: string;
  /** Badge heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Free-of-charge notice */
  freeText?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for item labels */
  locale?: 'ar' | 'en';
}

export function BeautyEmergencyKit({
  items,
  className = '',
  title = 'حقيبة الطوارئ',
  subtitle = 'كل ما تحتاجينه في الحالات الطارئة — متوفر في دورة المياه',
  freeText = 'مجاناً — لا حاجة للسؤال',
  footerText = 'لأن الطوارئ لا تخبرنا قبل أن تأتي',
  locale = 'ar',
}: BeautyEmergencyKitProps): JSX.Element | null {
  if (!items.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>

      {/* Items grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {items.map((item) => {
          const def = ITEMS[item];
          return (
            <div
              key={item}
              className="flex items-center gap-2 rounded-lg bg-rose-50 px-2.5 py-2 dark:bg-rose-950"
            >
              <span className="text-sm shrink-0" aria-hidden="true">
                {def.emoji}
              </span>
              <span className="text-[10px] font-medium text-rose-800 dark:text-rose-200">
                {def.label[locale]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Always free */}
      <div className="mt-2 rounded-lg bg-rose-50 p-2 text-center dark:bg-rose-950">
        <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300">{freeText}</p>
      </div>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
