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
  label: { ar: string; en: string };
  description: { ar: string; en: string };
  allowed: { ar: string; en: string }[];
  avoid: { ar: string; en: string }[];
  color: string;
}

const TRIMESTERS: Record<Trimester, TrimesterDef> = {
  1: {
    emoji: '',
    label: { ar: 'الثلث الأول', en: 'First trimester' },
    description: {
      ar: 'الأشهر 1-3 — فترة حساسة، عناية لطيفة فقط',
      en: 'Months 1-3 — a sensitive period, gentle care only',
    },
    allowed: [
      { ar: 'عناية بالبشرة خفيفة', en: 'Light skincare' },
      { ar: 'ترطيب', en: 'Moisturizing' },
      { ar: 'استشارة جمالية', en: 'Beauty consultation' },
    ],
    avoid: [
      { ar: 'مساج', en: 'Massage' },
      { ar: 'صبغات شعر', en: 'Hair dyes' },
      { ar: 'علاجات قوية', en: 'Strong treatments' },
      { ar: 'ساونا', en: 'Sauna' },
    ],
    color: 'border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/30',
  },
  2: {
    emoji: '',
    label: { ar: 'الثلث الثاني', en: 'Second trimester' },
    description: {
      ar: 'الأشهر 4-6 — الفترة الذهبية للعناية',
      en: 'Months 4-6 — the golden period for care',
    },
    allowed: [
      { ar: 'مساج ما قبل الولادة', en: 'Prenatal massage' },
      { ar: 'صبغة شعر خالية من الأمونيا', en: 'Ammonia-free hair dye' },
      { ar: 'باديكير', en: 'Pedicure' },
      { ar: 'عناية بالبشرة', en: 'Skincare' },
    ],
    avoid: [
      { ar: 'استلقاء على البطن', en: 'Lying on the stomach' },
      { ar: 'علاجات حرارية', en: 'Thermal treatments' },
      { ar: 'زيوت قوية', en: 'Strong oils' },
    ],
    color: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30',
  },
  3: {
    emoji: '',
    label: { ar: 'الثلث الثالث', en: 'Third trimester' },
    description: {
      ar: 'الأشهر 7-9 — راحة واستعداد للولادة',
      en: 'Months 7-9 — rest and preparation for birth',
    },
    allowed: [
      { ar: 'مساج قدمين', en: 'Foot massage' },
      { ar: 'تدليك ظهر خفيف', en: 'Light back massage' },
      { ar: 'ترطيب عميق', en: 'Deep moisturizing' },
      { ar: 'استرخاء', en: 'Relaxation' },
    ],
    avoid: [
      { ar: 'الاستلقاء على الظهر', en: 'Lying on the back' },
      { ar: 'وقت طويل', en: 'Long sessions' },
      { ar: 'علاجات قوية', en: 'Strong treatments' },
    ],
    color: 'border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/30',
  },
  postpartum: {
    emoji: '',
    label: { ar: 'ما بعد الولادة', en: 'Postpartum' },
    description: {
      ar: 'الأربعين يوماً — عناية النفاس التقليدية',
      en: 'The forty days — traditional postpartum care',
    },
    allowed: [
      { ar: 'ربط البطن', en: 'Belly binding' },
      { ar: 'علاج تساقط الشعر', en: 'Hair loss treatment' },
      { ar: 'مساج استرخاء', en: 'Relaxing massage' },
      { ar: 'ماسك مرطب', en: 'Moisturizing mask' },
    ],
    avoid: [
      { ar: 'علاجات قوية', en: 'Strong treatments' },
      { ar: 'تعرض للحرارة', en: 'Heat exposure' },
      { ar: 'وقوف طويل', en: 'Prolonged standing' },
    ],
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
  /** Badge showing the service is pregnancy-safe */
  safeLabel?: string;
  /** Currency suffix shown after the price */
  currencySuffix?: string;
  /** Label for the allowed section */
  allowedLabel?: string;
  /** Label for the avoid section */
  avoidLabel?: string;
  /** Disclaimer footer text */
  disclaimerText?: string;
  /** Locale for internal trimester data strings */
  locale?: 'ar' | 'en';
}

export function PregnancySafeBadge({
  trimester,
  service,
  className = '',
  safeLabel = 'آمن للحمل',
  currencySuffix = 'ر.س',
  allowedLabel = ' مسموح',
  avoidLabel = ' غير مناسب',
  disclaimerText = '🩺 استشيري طبيبكِ قبل أي علاج تجميلي أثناء الحمل',
  locale = 'ar',
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
          <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
            {t.label[locale]}
          </h4>
          <p className="text-[10px] text-text-tertiary dark:text-gray-400">
            {t.description[locale]}
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-white/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-black/20 dark:text-emerald-300">
          {safeLabel}
        </span>
      </div>

      {/* Service info */}
      {service && (
        <div className="mt-3 rounded-xl bg-white/70 p-3 dark:bg-gray-800/70">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-primary dark:text-gray-100">{service.name}</p>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {service.price} {currencySuffix}
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
          <h5 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {allowedLabel}
          </h5>
          <ul className="mt-1 space-y-0.5">
            {t.allowed.map((item) => (
              <li key={item.ar} className="text-[10px] text-text-secondary dark:text-gray-300">
                • {item[locale]}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-2.5 dark:bg-gray-800/70">
          <h5 className="text-[10px] font-bold text-rose-600 dark:text-rose-400">{avoidLabel}</h5>
          <ul className="mt-1 space-y-0.5">
            {t.avoid.map((item) => (
              <li key={item.ar} className="text-[10px] text-text-secondary dark:text-gray-300">
                • {item[locale]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {disclaimerText}
      </p>
    </div>
  );
}
