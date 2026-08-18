'use client';

import { cn } from '@galaxy/shared';

/**
 * Green Salon Badge — eco-friendly and sustainable salon practices.
 * From Phase W10: Saudi Women Leadership — Social Impact / Sustainability.
 *
 * Usage:
 *   <GreenSalonBadge practices={['recycled', 'organic', 'energy_efficient']} />
 */

type GreenPractice =
  | 'recycled'
  | 'organic'
  | 'energy_efficient'
  | 'water_saving'
  | 'vegan_products'
  | 'plastic_free'
  | 'local_sourcing'
  | 'carbon_neutral';

interface PracticeDef {
  emoji: string;
  label: { ar: string; en: string };
}

const PRACTICES: Record<GreenPractice, PracticeDef> = {
  recycled: { emoji: '️', label: { ar: 'إعادة تدوير', en: 'Recycling' } },
  organic: { emoji: '', label: { ar: 'منتجات عضوية', en: 'Organic products' } },
  energy_efficient: { emoji: '', label: { ar: 'طاقة موفرة', en: 'Energy efficient' } },
  water_saving: { emoji: '', label: { ar: 'ترشيد مياه', en: 'Water saving' } },
  vegan_products: { emoji: '', label: { ar: 'منتجات نباتية', en: 'Vegan products' } },
  plastic_free: { emoji: '', label: { ar: 'خالٍ من البلاستيك', en: 'Plastic free' } },
  local_sourcing: { emoji: '', label: { ar: 'منتجات محلية', en: 'Local sourcing' } },
  carbon_neutral: { emoji: '', label: { ar: 'محايد كربونياً', en: 'Carbon neutral' } },
};

interface GreenSalonBadgeProps {
  practices: GreenPractice[];
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Sustainability pledge text */
  pledgeText?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for practice labels */
  locale?: 'ar' | 'en';
}

export function GreenSalonBadge({
  practices,
  className = '',
  title = 'صالون أخضر',
  subtitle = 'نمارس الاستدامة في كل خطوة',
  pledgeText = 'نلتزم بممارسات صديقة للبيئة — من المنتجات إلى التغليف إلى استهلاك الطاقة',
  footerText = 'الجمال المستدام — لكِ وللأرض',
  locale = 'ar',
}: GreenSalonBadgeProps): JSX.Element | null {
  if (!practices.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-900 dark:from-green-950 dark:to-emerald-950',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-green-700 dark:text-green-300">{title}</h4>
          <p className="text-[10px] text-green-500 dark:text-green-400">{subtitle}</p>
        </div>
      </div>

      {/* Practices */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {practices.map((p) => {
          const def = PRACTICES[p];
          return (
            <div
              key={p}
              className="flex items-center gap-2 rounded-lg bg-white/60 px-2.5 py-2 dark:bg-gray-800/60"
            >
              <span className="text-sm" aria-hidden="true">
                {def.emoji}
              </span>
              <span className="text-[10px] font-medium text-green-800 dark:text-green-200">
                {def.label[locale]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pledge */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-green-700 dark:text-green-300">{pledgeText}</p>
      </div>

      <p className="mt-1.5 text-center text-[9px] text-green-600 dark:text-green-400">
        {footerText}
      </p>
    </div>
  );
}
