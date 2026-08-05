'use client';

import { cn } from '@galaxy/shared';

/**
 * Golden Beauty Card — gentle treatments for mature skin, classic timeless styles.
 * From Phase W2: Life Stage Beauty — Golden Beauty (55+).
 *
 * Usage:
 *   <GoldenBeautyCard age={62} onBook={() => {}} />
 */

interface GoldenService {
  emoji: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

const SERVICES: GoldenService[] = [
  { emoji: '🧖‍♀️', name: 'عناية لطيفة بالبشرة', description: 'تنظيف وترطيب عميق للبشرة الناضجة', price: 200, duration: '60 دقيقة' },
  { emoji: '💆‍♀️', name: 'مساج كلاسيكي', description: 'مساج لطيف للعضلات والمفاصل', price: 180, duration: '45 دقيقة' },
  { emoji: '💇', name: 'تسريحة كلاسيكية', description: 'تسريحة ناعمة تليق بجمالكِ', price: 150, duration: '45 دقيقة' },
  { emoji: '💄', name: 'مكياج ناعم', description: 'مكياج خفيف يبرز جمالكِ الطبيعي', price: 160, duration: '40 دقيقة' },
  { emoji: '💅', name: 'مانيكير لطيف', description: 'عناية بالأظافر مع ترطيب', price: 100, duration: '30 دقيقة' },
];

interface GoldenBeautyCardProps {
  age?: number;
  onBook?: (serviceName: string) => void;
  className?: string;
}

export function GoldenBeautyCard({
  age,
  onBook,
  className = '',
}: GoldenBeautyCardProps): JSX.Element {
  const isGolden = age !== undefined && age >= 55;

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">✨</span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">
          الجمال الذهبي
        </h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          {isGolden
            ? `عناية خاصة تناسب جمالكِ في سن ${age}`
            : 'عناية لطيفة للبشرة الناضجة'}
        </p>
      </div>

      {/* Special discount */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-lg" aria-hidden="true">🌺</p>
        <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
          خصم الساعة الذهبية
        </p>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          20% خصم على جميع الخدمات من 9 صباحاً إلى 12 ظهراً
        </p>
      </div>

      {/* Services */}
      <div className="mt-3 space-y-2">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">
          🌸 خدمات مختارة لكِ
        </p>
        {SERVICES.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60"
          >
            <span className="text-xl shrink-0" aria-hidden="true">{s.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                {s.name}
              </p>
              <p className="text-[10px] text-text-tertiary dark:text-gray-400">
                {s.description} · {s.duration}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                {s.price} ر.س
              </p>
              <button
                type="button"
                onClick={() => onBook?.(s.name)}
                className="mt-0.5 rounded-lg bg-amber-600 px-2 py-0.5 text-[9px] font-bold text-white hover:bg-amber-700"
              >
                احجزي
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gentle promise */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-center text-[10px] font-medium text-amber-700 dark:text-amber-300">
          💛 نعدكِ: لا منتجات قاسية · لا استعجال · احترام كامل لراحتكِ
        </p>
      </div>

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">
        ✨ الجمال ليس له عمر — وأنتِ أجمل في كل مرحلة
      </p>
    </div>
  );
}
