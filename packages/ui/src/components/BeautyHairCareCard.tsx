'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Hair Care Card — hair type-specific care tips.
 * From Phase W6: Education & Empowerment.
 *
 * Usage:
 *   <BeautyHairCareCard hairType="curly" porosity="high" />
 */

type HairType = 'straight' | 'wavy' | 'curly' | 'coily';
type Porosity = 'low' | 'medium' | 'high';

const TIPS: Record<HairType, Record<Porosity, string[]>> = {
  straight: { low: ['شامبو منقي أسبوعياً', 'بلسم خفيف', 'تجنبي الزيوت الثقيلة'], medium: ['غسيل كل 2-3 أيام', 'بلسم متوسط', 'حماية من الحرارة'], high: ['شامبو مرطب', 'بلسم عميق', 'زيوت خفيفة على الأطراف'] },
  wavy: { low: ['شامبو منقي', 'بلسم خفيف', 'منتجات رغوة'], medium: ['غسيل يومين ورا بعض', 'بلسم متوسط', 'سيروم خفيف'], high: ['Co-wash', 'بلسم عميق', 'زيوت طبيعية'] },
  curly: { low: ['شامبو منقي شهرياً', 'Co-wash أسبوعياً', 'منتجات خفيفة'], medium: ['Co-wash', 'بلسم عميق', 'جل تصفيف'], high: ['Co-wash', 'قناع شعر أسبوعي', 'زيوت وكريمات'] },
  coily: { low: ['Co-wash', 'منتجات خفيفة', 'صبقة شعر'], medium: ['Co-wash', 'قناع عميق', 'زبدة شعر'], high: ['Co-wash', 'قناع أسبوعي', 'زيوت ثقيلة'] },
};

const LABELS: Record<HairType, string> = { straight: 'ناعم', wavy: 'مموج', curly: 'مجعد', coily: 'متعرج' };

interface BeautyHairCareCardProps {
  hairType: HairType;
  porosity?: Porosity;
  className?: string;
}

export function BeautyHairCareCard({ hairType, porosity = 'medium', className = '' }: BeautyHairCareCardProps): JSX.Element {
  const tips = TIPS[hairType][porosity];

  return (
    <div className={cn('rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900', className)}>
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">💇</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">عناية بالشعر</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{LABELS[hairType]} · مسامية {porosity === 'low' ? 'منخفضة' : porosity === 'high' ? 'عالية' : 'متوسطة'}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-200 text-[9px] font-bold text-purple-700 dark:bg-purple-800 dark:text-purple-300">{i + 1}</span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
