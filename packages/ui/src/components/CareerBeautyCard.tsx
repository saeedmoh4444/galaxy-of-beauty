'use client';

import { cn } from '@galaxy/shared';

/**
 * Career Beauty Card — professional makeup & quick lunch-break services.
 * From Phase W2: Life Stage Beauty — Career & Confidence (25-35).
 *
 * Usage:
 *   <CareerBeautyCard profession="office" onBook={() => {}} />
 */

type Profession =
  'office' | 'healthcare' | 'education' | 'entrepreneur' | 'media' | 'customer_facing';

interface ProfDef {
  emoji: string;
  title: string;
  look: string;
  services: string[];
}

const PROFS: Record<Profession, ProfDef> = {
  office: {
    emoji: '',
    title: 'مكتبية',
    look: 'مكياج ناعم احترافي',
    services: ['مكياج يومي سريع', 'تسريحة عملية', 'مانيكير'],
  },
  healthcare: {
    emoji: '🩺',
    title: 'طبية',
    look: 'إطلالة عملية ونظيفة',
    services: ['عناية بالبشرة', 'حواجب مرتبة', 'أظافر قصيرة'],
  },
  education: {
    emoji: '',
    title: 'تعليمية',
    look: 'مكياج خفيف ولطيف',
    services: ['تنظيف بشرة', 'ترطيب', 'مكياج خفيف'],
  },
  entrepreneur: {
    emoji: '',
    title: 'رائدة أعمال',
    look: 'إطلالة قوية وواثقة',
    services: ['مكياج احترافي', 'تسريحة قوية', 'استشارة ألوان'],
  },
  media: {
    emoji: '',
    title: 'إعلامية',
    look: 'مكياج كاميرا',
    services: ['مكياج HD', 'تسريحة', 'مانيكير وباديكير'],
  },
  customer_facing: {
    emoji: '',
    title: 'خدمة عملاء',
    look: 'إطلالة ودودة وجذابة',
    services: ['مكياج طبيعي', 'ابتسامة هوليوود', 'عناية بالأظافر'],
  },
};

interface CareerBeautyCardProps {
  profession: Profession;
  onBook?: () => void;
  className?: string;
}

export function CareerBeautyCard({
  profession,
  onBook,
  className = '',
}: CareerBeautyCardProps): JSX.Element {
  const prof = PROFS[profession];

  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-5 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 text-2xl dark:from-sky-900 dark:to-blue-900">
          {prof.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">جمال المهنة</h4>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">
            {prof.title} — {prof.look}
          </p>
        </div>
      </div>

      {/* Quick services highlight */}
      <div className="mt-3 rounded-xl bg-sky-50 p-3 dark:bg-sky-950">
        <p className="text-[10px] font-bold text-sky-700 dark:text-sky-300">
           خدمات سريعة (30 دقيقة)
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {prof.services.map((s) => (
            <span
              key={s}
              className="rounded-full bg-white px-2 py-0.5 text-[9px] text-sky-700 dark:bg-gray-800 dark:text-sky-300"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Lunch break special */}
      <div className="mt-2 rounded-xl bg-gradient-to-r from-sky-100 to-blue-100 p-3 dark:from-sky-900 dark:to-blue-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm" aria-hidden="true">
              
            </span>
            <div>
              <p className="text-[10px] font-bold text-sky-800 dark:text-sky-200">
                خدمة استراحة الغداء
              </p>
              <p className="text-[10px] text-sky-600 dark:text-sky-400">
                احجزي في استراحة غدائكِ — 30 دقيقة فقط
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-gray-800 dark:text-sky-300">
            150 ر.س
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-700 active:scale-[0.98] transition-all"
      >
        احجزي استراحة جمالكِ 
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         المرأة العاملة تستحق أن تتألق — حتى في أكثر أيامها انشغالاً
      </p>
    </div>
  );
}
