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
  label: string;
}

const ITEMS: Record<KitItem, ItemDef> = {
  pads: { emoji: '🩹', label: 'فوط صحية' },
  tampons: { emoji: '🩹', label: 'سدادات قطنية' },
  hair_spray: { emoji: '💨', label: 'مثبت شعر' },
  bobby_pins: { emoji: '📌', label: 'دبابيس شعر' },
  hair_tie: { emoji: '🎀', label: 'ربطة شعر' },
  deodorant: { emoji: '🌸', label: 'مزيل عرق' },
  sewing_kit: { emoji: '🪡', label: 'عدة خياطة' },
  stain_remover: { emoji: '🧼', label: 'مزيل بقع' },
  nail_file: { emoji: '💅', label: 'مبرد أظافر' },
  mints: { emoji: '🍬', label: 'منعش نفس' },
};

interface BeautyEmergencyKitProps {
  items: KitItem[];
  className?: string;
}

export function BeautyEmergencyKit({
  items,
  className = '',
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
        <span className="text-xl" aria-hidden="true">
          🎒
        </span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">حقيبة الطوارئ</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">
            كل ما تحتاجينه في الحالات الطارئة — متوفر في دورة المياه
          </p>
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
                {def.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Always free */}
      <div className="mt-2 rounded-lg bg-rose-50 p-2 text-center dark:bg-rose-950">
        <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
          🎀 مجاناً — لا حاجة للسؤال
        </p>
      </div>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        💝 لأن الطوارئ لا تخبرنا قبل أن تأتي
      </p>
    </div>
  );
}
