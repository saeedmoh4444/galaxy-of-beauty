'use client';

import { cn } from '@galaxy/shared';

/**
 * Service Animal Badge — signals service animals are welcome at partner salons.
 * From Phase W8: Accessibility & Inclusivity — Every Woman, Every Body.
 *
 * Usage:
 *   <ServiceAnimalBadge />
 */

interface ServiceAnimalBadgeProps {
  title?: string;
  subtitle?: string;
  item1?: string;
  item2?: string;
  item3?: string;
  item4?: string;
  proofNoteText?: string;
  footerText?: string;
  className?: string;
}

export function ServiceAnimalBadge({
  className = '',
  title = 'حيوانات الخدمة مرحب بها',
  subtitle = 'نرحب بحيوانات الخدمة في جميع مرافقنا',
  item1 = '• مكان مخصص لحيوان الخدمة بجانبكِ',
  item2 = '• ماء متوفر لحيوانكِ',
  item3 = '• فريق مدرب على التعامل مع حيوانات الخدمة',
  item4 = '• مساحة كافية للكرسي المتحرك وحيوان الخدمة معاً',
  proofNoteText = '‍ لا نحتاج إثبات — وجودكِ مع حيوانكِ يكفي',
  footerText = 'الوصول حق للجميع',
}: ServiceAnimalBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          ‍
        </span>
        <div>
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">{title}</h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
        <div className="space-y-1.5 text-[10px] text-blue-700 dark:text-blue-300">
          <p>{item1}</p>
          <p>{item2}</p>
          <p>{item3}</p>
          <p>{item4}</p>
        </div>
      </div>

      <div className="mt-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
        <p className="text-center text-[10px] text-text-secondary dark:text-gray-300">
          {proofNoteText}
        </p>
      </div>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
