'use client';

import { cn } from '@galaxy/shared';

/**
 * Life Event Card — beauty packages for major life moments.
 * From Phase W2: Life Stage Beauty — Life Event Packages.
 *
 * Usage:
 *   <LifeEventCard event="wedding" onBook={() => {}} />
 */

type LifeEvent =
  | 'graduation'
  | 'new_job'
  | 'wedding'
  | 'pregnancy'
  | 'new_mother'
  | 'birthday'
  | 'hajj_umrah'
  | 'divorce_recovery';

interface EventDef {
  emoji: string;
  title: string;
  description: string;
  packageName: string;
  contents: string[];
  price: number;
  color: string;
  gradient: string;
}

const EVENTS: Record<LifeEvent, EventDef> = {
  graduation: {
    emoji: '🎓',
    title: 'تخرج',
    description: 'انطلاقة جديدة تليق بإنجازكِ',
    packageName: 'إشراقة الخريجة',
    contents: ['مكياج احترافي', 'تسريحة شعر', 'مانيكير', 'جلسة تصوير'],
    price: 450,
    color: 'border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/20',
    gradient: 'from-amber-500 to-yellow-500',
  },
  new_job: {
    emoji: '💼',
    title: 'وظيفة جديدة',
    description: 'انطباع أول لا يُنسى',
    packageName: 'جاهزة ليومي الأول',
    contents: ['مكياج احترافي', 'استشارة إطلالة', 'جلسة تصوير للملف'],
    price: 350,
    color: 'border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20',
    gradient: 'from-blue-500 to-sky-500',
  },
  wedding: {
    emoji: '👰',
    title: 'زواج',
    description: 'رحلة متكاملة ليوم العمر',
    packageName: 'رحلة العروس',
    contents: ['6 أشهر عناية بالبشرة', 'تجربة مكياج', 'ليلة الحناء', 'يوم الزفاف', 'شهر عسل'],
    price: 2500,
    color: 'border-rose-200 bg-rose-50/30 dark:border-rose-900 dark:bg-rose-950/20',
    gradient: 'from-rose-500 to-pink-500',
  },
  pregnancy: {
    emoji: '🤰',
    title: 'حمل',
    description: 'عناية خاصة بكِ وبطفلكِ',
    packageName: 'الأم المتوهجة',
    contents: ['مساج ما قبل الولادة', 'عناية بالبشرة آمنة', 'باديكير', 'كريمات ترطيب'],
    price: 300,
    color: 'border-purple-200 bg-purple-50/30 dark:border-purple-900 dark:bg-purple-950/20',
    gradient: 'from-purple-500 to-violet-500',
  },
  new_mother: {
    emoji: '👶',
    title: 'أمومة جديدة',
    description: 'استعيدي نضارتكِ بعد الولادة',
    packageName: 'انتعاشة الأم',
    contents: ['عناية بالبشرة سريعة', 'تسريحة شعر سريعة', 'مانيكير', 'جلسة استرخاء'],
    price: 250,
    color: 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20',
    gradient: 'from-emerald-500 to-teal-500',
  },
  birthday: {
    emoji: '🎂',
    title: 'عيد ميلاد',
    description: 'احتفلي بنفسكِ بأجمل إطلالة',
    packageName: 'متألقة في يومي',
    contents: ['مكياج سهرة', 'تسريحة شعر', 'مانيكير وباديكير', 'هدية مفاجأة'],
    price: 400,
    color: 'border-pink-200 bg-pink-50/30 dark:border-pink-900 dark:bg-pink-950/20',
    gradient: 'from-pink-500 to-fuchsia-500',
  },
  hajj_umrah: {
    emoji: '🕋',
    title: 'حج / عمرة',
    description: 'استعداد روحي وجمالي للرحلة المباركة',
    packageName: 'إشراقة الحاجّة',
    contents: ['عناية بالبشرة', 'إزالة شعر', 'حقيبة عناية للسفر', 'جلسة استرخاء'],
    price: 350,
    color: 'border-teal-200 bg-teal-50/30 dark:border-teal-900 dark:bg-teal-950/20',
    gradient: 'from-teal-500 to-emerald-500',
  },
  divorce_recovery: {
    emoji: '🦋',
    title: 'بداية جديدة',
    description: 'انطلاقة جديدة بعد التغيير',
    packageName: 'بداية جديدة',
    contents: ['استشارة إطلالة كاملة', 'مكياج تعليمي', 'تسريحة جديدة', 'يوم سبا مصغر'],
    price: 500,
    color: 'border-indigo-200 bg-indigo-50/30 dark:border-indigo-900 dark:bg-indigo-950/20',
    gradient: 'from-indigo-500 to-purple-500',
  },
};

interface LifeEventCardProps {
  event: LifeEvent;
  onBook?: () => void;
  className?: string;
}

export function LifeEventCard({
  event,
  onBook,
  className = '',
}: LifeEventCardProps): JSX.Element {
  const e = EVENTS[event];

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 transition-shadow hover:shadow-md',
        e.color,
        className,
      )}
    >
      {/* Event header */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl text-white',
          e.gradient,
        )}>
          {e.emoji}
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
            {e.title}
          </h4>
          <p className="text-[10px] text-text-tertiary dark:text-gray-400">
            {e.description}
          </p>
        </div>
      </div>

      {/* Package name */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
          🎁 {e.packageName}
        </p>
        <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5">
          {e.contents.map((item) => (
            <li key={item} className="text-[10px] text-text-secondary dark:text-gray-300">
              ✨ {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Price + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">السعر</p>
          <p className="text-lg font-bold text-text-primary dark:text-gray-100">
            {e.price} ر.س
          </p>
        </div>
        <button
          type="button"
          onClick={onBook}
          className={cn(
            'rounded-xl px-4 py-2.5 text-xs font-bold text-white active:scale-[0.98] transition-all shadow-sm',
            `bg-gradient-to-r ${e.gradient}`,
          )}
        >
          احجزي الآن
        </button>
      </div>
    </div>
  );
}
