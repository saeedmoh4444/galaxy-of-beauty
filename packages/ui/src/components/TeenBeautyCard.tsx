'use client';

import { cn } from '@galaxy/shared';

/**
 * Teen Beauty Card — age-appropriate first beauty experience for girls 12-17.
 * From Phase W7: Mother-Daughter & Family — Girls' First Beauty.
 *
 * Usage:
 *   <TeenBeautyCard
 *     service={{ name: 'أول درس مكياج', ageRange: '12-15', price: 150 }}
 *     onBookWithParent={() => {}}
 *   />
 */

interface TeenService {
  name: string;
  ageRange: string;
  price: number;
  emoji?: string;
  duration?: string;
  description?: string;
  /** Requires parent approval */
  parentRequired?: boolean;
  /** What she'll learn */
  learningPoints?: string[];
}

interface TeenBeautyCardProps {
  service: TeenService;
  onBookWithParent?: () => void;
  className?: string;
}

export function TeenBeautyCard({
  service,
  onBookWithParent,
  className = '',
}: TeenBeautyCardProps): JSX.Element {
  const ageMin = Number(service.ageRange.split('-')[0]) || 12;

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 transition-shadow hover:shadow-md dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Age badge + emoji */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-xl dark:from-purple-900 dark:to-pink-900">
            {service.emoji || '🎀'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
              {service.name}
            </h4>
            <p className="text-[10px] text-text-tertiary dark:text-gray-400">
              ⏱️ {service.duration || '45 دقيقة'}
            </p>
          </div>
        </div>

        {/* Age range pill */}
        <span className="shrink-0 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
          {service.ageRange} سنة
        </span>
      </div>

      {/* Description */}
      {service.description && (
        <p className="mt-2 text-xs leading-relaxed text-text-secondary dark:text-gray-300">
          {service.description}
        </p>
      )}

      {/* Learning points */}
      {service.learningPoints && service.learningPoints.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
            📝 راح تتعلم:
          </p>
          {service.learningPoints.map((point, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px] text-purple-400" aria-hidden="true">
                ✨
              </span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300">
                {point}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Parent notice */}
      {service.parentRequired && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 dark:bg-amber-950">
          <span className="text-sm" aria-hidden="true">👩‍👧</span>
          <div>
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
              بموافقة الأم
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              تحتاجين موافقة والدتكِ قبل الحجز. يمكنها الموافقة من خلال تطبيق الأهل.
            </p>
          </div>
        </div>
      )}

      {/* Age-appropriate reminder */}
      <div className="mt-2 flex items-start gap-2 rounded-xl bg-purple-50 p-2.5 dark:bg-purple-950">
        <span className="text-sm" aria-hidden="true">🌸</span>
        <div>
          <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
            مناسبة لعمركِ
          </p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400">
            {ageMin <= 12
              ? 'منتجات خفيفة وطبيعية — لا كريم أساس ثقيل ولا أظافر أكريليك'
              : 'عناية لطيفة مناسبة لسنكِ — التركيز على العناية قبل التجميل'}
          </p>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
            {service.price} ر.س
          </span>
          {service.parentRequired && (
            <span className="ml-1 text-[10px] text-text-tertiary dark:text-gray-500">
              + موافقة ولي الأمر
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onBookWithParent}
          className="rounded-xl bg-purple-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
        >
          احجزي مع أمكِ 👩‍👧
        </button>
      </div>
    </div>
  );
}
