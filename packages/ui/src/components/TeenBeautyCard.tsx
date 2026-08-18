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
  /** Fallback duration when the service has none */
  defaultDuration?: string;
  /** Suffix after the age range */
  yearsSuffix?: string;
  /** "You will learn" heading */
  learningTitle?: string;
  /** Parent approval heading */
  parentApprovalTitle?: string;
  /** Parent approval notice */
  parentApprovalText?: string;
  /** Age-appropriate heading */
  ageAppropriateTitle?: string;
  /** Age-appropriate text for younger teens */
  ageAppropriateYoung?: string;
  /** Age-appropriate text for older teens */
  ageAppropriateOlder?: string;
  /** Currency suffix for the price */
  currencySuffix?: string;
  /** Parent consent suffix after the price */
  parentConsentSuffix?: string;
  /** Book with parent button label */
  bookWithParentText?: string;
}

export function TeenBeautyCard({
  service,
  onBookWithParent,
  className = '',
  defaultDuration = '45 دقيقة',
  yearsSuffix = 'سنة',
  learningTitle = 'راح تتعلم:',
  parentApprovalTitle = 'بموافقة الأم',
  parentApprovalText = 'تحتاجين موافقة والدتكِ قبل الحجز. يمكنها الموافقة من خلال تطبيق الأهل.',
  ageAppropriateTitle = 'مناسبة لعمركِ',
  ageAppropriateYoung = 'منتجات خفيفة وطبيعية — لا كريم أساس ثقيل ولا أظافر أكريليك',
  ageAppropriateOlder = 'عناية لطيفة مناسبة لسنكِ — التركيز على العناية قبل التجميل',
  currencySuffix = 'ر.س',
  parentConsentSuffix = '+ موافقة ولي الأمر',
  bookWithParentText = 'احجزي مع أمكِ ‍',
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
            {service.emoji || ''}
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
              {service.name}
            </h4>
            <p className="text-[10px] text-text-tertiary dark:text-gray-400">
              ️ {service.duration || defaultDuration}
            </p>
          </div>
        </div>

        {/* Age range pill */}
        <span className="shrink-0 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
          {service.ageRange} {yearsSuffix}
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
            {learningTitle}
          </p>
          {service.learningPoints.map((point, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px] text-purple-400" aria-hidden="true"></span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300">{point}</span>
            </div>
          ))}
        </div>
      )}

      {/* Parent notice */}
      {service.parentRequired && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 dark:bg-amber-950">
          <span className="text-sm" aria-hidden="true">
            ‍
          </span>
          <div>
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
              {parentApprovalTitle}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">{parentApprovalText}</p>
          </div>
        </div>
      )}

      {/* Age-appropriate reminder */}
      <div className="mt-2 flex items-start gap-2 rounded-xl bg-purple-50 p-2.5 dark:bg-purple-950">
        <span className="text-sm" aria-hidden="true"></span>
        <div>
          <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
            {ageAppropriateTitle}
          </p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400">
            {ageMin <= 12 ? ageAppropriateYoung : ageAppropriateOlder}
          </p>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
            {service.price} {currencySuffix}
          </span>
          {service.parentRequired && (
            <span className="ml-1 text-[10px] text-text-tertiary dark:text-gray-500">
              {parentConsentSuffix}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onBookWithParent}
          className="rounded-xl bg-purple-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
        >
          {bookWithParentText}
        </button>
      </div>
    </div>
  );
}
