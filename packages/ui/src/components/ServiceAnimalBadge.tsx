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
  className?: string;
}

export function ServiceAnimalBadge({ className = '' }: ServiceAnimalBadgeProps): JSX.Element {
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
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">
            حيوانات الخدمة مرحب بها
          </h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">
            نرحب بحيوانات الخدمة في جميع مرافقنا
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
        <div className="space-y-1.5 text-[10px] text-blue-700 dark:text-blue-300">
          <p>• مكان مخصص لحيوان الخدمة بجانبكِ</p>
          <p>• ماء متوفر لحيوانكِ</p>
          <p>• فريق مدرب على التعامل مع حيوانات الخدمة</p>
          <p>• مساحة كافية للكرسي المتحرك وحيوان الخدمة معاً</p>
        </div>
      </div>

      <div className="mt-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
        <p className="text-center text-[10px] text-text-secondary dark:text-gray-300">
          ‍ لا نحتاج إثبات — وجودكِ مع حيوانكِ يكفي
        </p>
      </div>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         الوصول حق للجميع
      </p>
    </div>
  );
}
