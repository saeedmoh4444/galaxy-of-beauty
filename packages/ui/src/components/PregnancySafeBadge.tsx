'use client';

import { cn } from '@galaxy/shared';

/**
 * Pregnancy-Safe Badge — signals services that are safe during pregnancy.
 * From Phase W3: Health & Wellness — Pregnancy & Postpartum Beauty.
 *
 * Usage:
 *   <PregnancySafeBadge trimester={2} service={{ name: 'مساج ما قبل الولادة', price: 200 }} />
 */

type Trimester = 1 | 2 | 3 | 'postpartum';

interface TrimesterDef {
  emoji: string;
  label: string;
  description: string;
  allowed: string[];
  avoid: string[];
  color: string;
}

const TRIMESTERS: Record<Trimester, TrimesterDef> = {
  1: {
    emoji: '',
    label: 'الثلث الأول',
    description: 'الأشهر 1-3 — فترة حساسة، عناية لطيفة فقط',
    allowed: ['عناية بالبشرة خفيفة', 'ترطيب', 'استشارة جمالية'],
    avoid: ['مساج', 'صبغات شعر', 'علاجات قوية', 'ساونا'],
    color: 'border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/30',
  },
  2: {
    emoji: '',
    label: 'الثلث الثاني',
    description: 'الأشهر 4-6 — الفترة الذهبية للعناية',
    allowed: ['مساج ما قبل الولادة', 'صبغة شعر خالية من الأمونيا', 'باديكير', 'عناية بالبشرة'],
    avoid: ['استلقاء على البطن', 'علاجات حرارية', 'زيوت قوية'],
    color: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30',
  },
  3: {
    emoji: '',
    label: 'الثلث الثالث',
    description: 'الأشهر 7-9 — راحة واستعداد للولادة',
    allowed: ['مساج قدمين', 'تدليك ظهر خفيف', 'ترطيب عميق', 'استرخاء'],
    avoid: ['الاستلقاء على الظهر', 'وقت طويل', 'علاجات قوية'],
    color: 'border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/30',
  },
  postpartum: {
    emoji: '',
    label: 'ما بعد الولادة',
    description: 'الأربعين يوماً — عناية النفاس التقليدية',
    allowed: ['ربط البطن', 'علاج تساقط الشعر', 'مساج استرخاء', 'ماسك مرطب'],
    avoid: ['علاجات قوية', 'تعرض للحرارة', 'وقوف طويل'],
    color: 'border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/30',
  },
};

interface PregnancySafeService {
  name: string;
  price: number;
  duration?: string;
}

interface PregnancySafeBadgeProps {
  trimester: Trimester;
  service?: PregnancySafeService;
  className?: string;
}

export function PregnancySafeBadge({
  trimester,
  service,
  className = '',
}: PregnancySafeBadgeProps): JSX.Element {
  const t = TRIMESTERS[trimester];

  return (
    <div className={cn('rounded-2xl border p-4', t.color, className)}>
      {/* Trimester indicator */}
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">
          {t.emoji}
        </span>
        <div>
          <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">{t.label}</h4>
          <p className="text-[10px] text-text-tertiary dark:text-gray-400">{t.description}</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-white/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-black/20 dark:text-emerald-300">
           آمن للحمل
        </span>
      </div>

      {/* Service info */}
      {service && (
        <div className="mt-3 rounded-xl bg-white/70 p-3 dark:bg-gray-800/70">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-primary dark:text-gray-100">{service.name}</p>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {service.price} ر.س
            </span>
          </div>
          {service.duration && (
            <p className="mt-0.5 text-[10px] text-text-tertiary dark:text-gray-400">
              ️ {service.duration}
            </p>
          )}
        </div>
      )}

      {/* Allowed & Avoid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/70 p-2.5 dark:bg-gray-800/70">
          <h5 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400"> مسموح</h5>
          <ul className="mt-1 space-y-0.5">
            {t.allowed.map((item) => (
              <li key={item} className="text-[10px] text-text-secondary dark:text-gray-300">
                • {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-2.5 dark:bg-gray-800/70">
          <h5 className="text-[10px] font-bold text-rose-600 dark:text-rose-400"> غير مناسب</h5>
          <ul className="mt-1 space-y-0.5">
            {t.avoid.map((item) => (
              <li key={item} className="text-[10px] text-text-secondary dark:text-gray-300">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        🩺 استشيري طبيبكِ قبل أي علاج تجميلي أثناء الحمل
      </p>
    </div>
  );
}
