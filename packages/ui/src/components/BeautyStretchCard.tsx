'use client';

import { cn } from '@galaxy/shared';

interface BeautyStretchCardProps {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}

export function BeautyStretchCard({
  className = '',
  locale = 'ar',
  title = 'تمارين الإطالة',
  subtitle = '5 دقائق صباحاً = يوم كامل من النشاط',
}: BeautyStretchCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          {
            emoji: '',
            name: { ar: 'إطالة الرقبة', en: 'Neck stretch' },
            desc: {
              ar: 'إمالة بطيئة يمين ويسار — 30 ثانية',
              en: 'Slow tilt left and right — 30 seconds',
            },
          },
          {
            emoji: '',
            name: { ar: 'إطالة الكتف', en: 'Shoulder stretch' },
            desc: { ar: 'لف الكتفين للخلف 10 مرات', en: 'Roll shoulders back 10 times' },
          },
          {
            emoji: '',
            name: { ar: 'لمس القدمين', en: 'Toe touch' },
            desc: { ar: 'انحناء للأمام — 20 ثانية', en: 'Bend forward — 20 seconds' },
          },
          {
            emoji: '🪑',
            name: { ar: 'إطالة الظهر', en: 'Back stretch' },
            desc: {
              ar: 'لف الجذع يمين ويسار — 10 مرات',
              en: 'Twist the torso left and right — 10 times',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-teal-800 dark:text-teal-200">
                {t.name[locale]}
              </p>
              <p className="text-[9px] text-teal-600 dark:text-teal-400">{t.desc[locale]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
