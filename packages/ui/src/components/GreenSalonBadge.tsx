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
  label: string;
}

const PRACTICES: Record<GreenPractice, PracticeDef> = {
  recycled: { emoji: '️', label: 'إعادة تدوير' },
  organic: { emoji: '', label: 'منتجات عضوية' },
  energy_efficient: { emoji: '', label: 'طاقة موفرة' },
  water_saving: { emoji: '', label: 'ترشيد مياه' },
  vegan_products: { emoji: '', label: 'منتجات نباتية' },
  plastic_free: { emoji: '', label: 'خالٍ من البلاستيك' },
  local_sourcing: { emoji: '', label: 'منتجات محلية' },
  carbon_neutral: { emoji: '', label: 'محايد كربونياً' },
};

interface GreenSalonBadgeProps {
  practices: GreenPractice[];
  className?: string;
}

export function GreenSalonBadge({
  practices,
  className = '',
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
        <span className="text-xl" aria-hidden="true">
          
        </span>
        <div>
          <h4 className="text-sm font-bold text-green-700 dark:text-green-300">صالون أخضر</h4>
          <p className="text-[10px] text-green-500 dark:text-green-400">
            نمارس الاستدامة في كل خطوة
          </p>
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
                {def.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pledge */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-green-700 dark:text-green-300">
           نلتزم بممارسات صديقة للبيئة — من المنتجات إلى التغليف إلى استهلاك الطاقة
        </p>
      </div>

      <p className="mt-1.5 text-center text-[9px] text-green-600 dark:text-green-400">
         الجمال المستدام — لكِ وللأرض
      </p>
    </div>
  );
}
