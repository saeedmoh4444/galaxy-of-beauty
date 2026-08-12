'use client';

import { cn } from '@galaxy/shared';

/**
 * Postpartum Care Card — traditional Saudi postpartum recovery (40-day نفاس).
 * From Phase W3: Health & Wellness — Pregnancy & Postpartum Beauty.
 *
 * Usage:
 *   <PostpartumCareCard daysSinceBirth={15} onBook={() => {}} />
 */

interface PostpartumService {
  emoji: string;
  name: string;
  description: string;
  price: number;
  availableFromDay: number; // days after birth
}

const SERVICES: PostpartumService[] = [
  {
    emoji: '🪢',
    name: 'ربط البطن التقليدي',
    description: 'ربط البطن بالطريقة السعودية التقليدية لدعم التعافي',
    price: 150,
    availableFromDay: 3,
  },
  {
    emoji: '‍️',
    name: 'مساج النفاس',
    description: 'مساج لطيف للجسم بالزيوت الدافئة لتخفيف الآلام',
    price: 200,
    availableFromDay: 7,
  },
  {
    emoji: '‍️',
    name: 'علاج تساقط الشعر',
    description: 'علاج طبيعي لتساقط الشعر بعد الولادة',
    price: 180,
    availableFromDay: 30,
  },
  {
    emoji: '‍️',
    name: 'عناية بالبشرة للنفاس',
    description: 'ترطيب عميق وتوحيد لون البشرة بعد التغيرات الهرمونية',
    price: 160,
    availableFromDay: 14,
  },
  {
    emoji: '',
    name: 'إطلالة الخروج الأولى',
    description: 'مكياج ناعم وتصفيفة شعر لأول خروج بعد النفاس',
    price: 250,
    availableFromDay: 40,
  },
];

interface PostpartumCareCardProps {
  daysSinceBirth: number;
  onBook?: (serviceName: string) => void;
  className?: string;
}

export function PostpartumCareCard({
  daysSinceBirth,
  onBook,
  className = '',
}: PostpartumCareCardProps): JSX.Element {
  const isNifasComplete = daysSinceBirth >= 40;

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-5 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          
        </span>
        <h4 className="mt-1 text-sm font-bold text-purple-700 dark:text-purple-300">
          عناية النفاس
        </h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">
          {isNifasComplete
            ? ' اكتملت الأربعون — ألف مبروك!'
            : `اليوم ${daysSinceBirth} من النفاس — ${40 - daysSinceBirth} يوم متبقي`}
        </p>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-text-tertiary dark:text-gray-400">تقدم التعافي</span>
          <span className="font-bold text-purple-700 dark:text-purple-300">
            {Math.min(100, Math.round((daysSinceBirth / 40) * 100))}%
          </span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-violet-500 transition-all duration-700"
            style={{ width: `${Math.min(100, Math.round((daysSinceBirth / 40) * 100))}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-text-tertiary dark:text-gray-500">
          <span>اليوم 1</span>
          <span>اليوم 40</span>
        </div>
      </div>

      {/* Services */}
      <div className="mt-3 space-y-2">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
           خدمات النفاس المتاحة
        </p>
        {SERVICES.map((service) => {
          const isAvailable = daysSinceBirth >= service.availableFromDay;
          const daysUntil = service.availableFromDay - daysSinceBirth;

          return (
            <div
              key={service.name}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 transition-all',
                isAvailable
                  ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
                  : 'border-gray-100 bg-gray-50 opacity-60 dark:border-gray-800 dark:bg-gray-800',
              )}
            >
              <span className="text-lg shrink-0" aria-hidden="true">
                {service.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                  {service.name}
                </p>
                <p className="text-[10px] text-text-tertiary dark:text-gray-400">
                  {service.description}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {isAvailable ? (
                  <>
                    <p className="text-xs font-bold text-purple-700 dark:text-purple-400">
                      {service.price} ر.س
                    </p>
                    <button
                      type="button"
                      onClick={() => onBook?.(service.name)}
                      className="mt-0.5 rounded-lg bg-purple-600 px-2 py-0.5 text-[9px] font-bold text-white hover:bg-purple-700"
                    >
                      احجزي
                    </button>
                  </>
                ) : (
                  <p className="text-[10px] text-text-tertiary dark:text-gray-500">
                    متاحة بعد {daysUntil} يوم
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Traditional wisdom */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-purple-50 to-rose-50 p-3 dark:from-purple-950 dark:to-rose-950">
        <p className="text-center text-[10px] font-medium text-purple-700 dark:text-purple-300">
           &ldquo;الأربعين يوم راحة وتعافي — اعتني بنفسكِ كما تعتنين بطفلكِ&rdquo;
        </p>
      </div>
    </div>
  );
}
