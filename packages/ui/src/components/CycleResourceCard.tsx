'use client';

import { cn } from '@galaxy/shared';

/**
 * Cycle Resource Card — educational resources about menstrual health & beauty.
 * From Phase W3: Health & Wellness — Cycle-Aware Beauty.
 *
 * Usage:
 *   <CycleResourceCard phase="luteal" />
 */

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

interface Resource {
  emoji: string;
  title: { ar: string; en: string };
  detail: { ar: string; en: string };
}

const RESOURCES: Record<CyclePhase, Resource[]> = {
  menstrual: [
    {
      emoji: '🩸',
      title: { ar: 'فهم الدورة', en: 'Understanding the cycle' },
      detail: {
        ar: 'الجسم يتخلص من بطانة الرحم — طبيعي تماماً',
        en: 'The body sheds the uterine lining — completely natural',
      },
    },
    {
      emoji: '',
      title: { ar: 'تغذية', en: 'Nutrition' },
      detail: {
        ar: 'أطعمة غنية بالحديد: سبانخ، عدس، لحم أحمر',
        en: 'Iron-rich foods: spinach, lentils, red meat',
      },
    },
    {
      emoji: '',
      title: { ar: 'حركة', en: 'Movement' },
      detail: {
        ar: 'مشي خفيف ويوغا لطيفة — لا تمارين قاسية',
        en: 'Light walking and gentle yoga — no intense workouts',
      },
    },
  ],
  follicular: [
    {
      emoji: '',
      title: { ar: 'طاقة متجددة', en: 'Renewed energy' },
      detail: {
        ar: 'الإستروجين يرتفع — طاقتكِ في الذروة',
        en: 'Estrogen rises — your energy peaks',
      },
    },
    {
      emoji: '',
      title: { ar: 'تغذية', en: 'Nutrition' },
      detail: { ar: 'بروتينات خفيفة وخضروات طازجة', en: 'Light proteins and fresh vegetables' },
    },
    {
      emoji: '',
      title: { ar: 'حركة', en: 'Movement' },
      detail: {
        ar: 'أفضل وقت للتمارين القوية والنشاط',
        en: 'The best time for intense exercise and activity',
      },
    },
  ],
  ovulation: [
    {
      emoji: '',
      title: { ar: 'إشراقة', en: 'Radiance' },
      detail: {
        ar: 'البشرة في أفضل حالاتها — وقت المناسبات',
        en: 'Your skin at its best — time for events',
      },
    },
    {
      emoji: '',
      title: { ar: 'ترطيب', en: 'Hydration' },
      detail: {
        ar: 'اشربي ماء كثيراً — بشرتكِ تشكركِ',
        en: 'Drink plenty of water — your skin will thank you',
      },
    },
    {
      emoji: '',
      title: { ar: 'ثقة', en: 'Confidence' },
      detail: {
        ar: 'أعلى درجات الثقة — وقت التصوير والمناسبات',
        en: 'Peak confidence — time for photos and occasions',
      },
    },
  ],
  luteal: [
    {
      emoji: '',
      title: { ar: 'استعداد', en: 'Preparation' },
      detail: {
        ar: 'الجسم يستعد للدورة القادمة — خذي الأمور بهدوء',
        en: 'The body prepares for the next cycle — take things easy',
      },
    },
    {
      emoji: '',
      title: { ar: 'تغذية', en: 'Nutrition' },
      detail: {
        ar: 'مغنيسيوم: مكسرات، موز، شوكولاتة داكنة',
        en: 'Magnesium: nuts, bananas, dark chocolate',
      },
    },
    {
      emoji: '',
      title: { ar: 'استرخاء', en: 'Relaxation' },
      detail: {
        ar: 'حمام دافئ، تأمل، قراءة — دللي نفسكِ',
        en: 'A warm bath, meditation, reading — pamper yourself',
      },
    },
  ],
};

interface CycleResourceCardProps {
  phase: CyclePhase;
  className?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Locale for internal resource data strings */
  locale?: 'ar' | 'en';
}

const PHASE_LABELS: Record<CyclePhase, { emoji: string; title: { ar: string; en: string } }> = {
  menstrual: { emoji: '🩸', title: { ar: 'الدورة الشهرية', en: 'Menstrual phase' } },
  follicular: { emoji: '', title: { ar: 'المرحلة الجرابية', en: 'Follicular phase' } },
  ovulation: { emoji: '', title: { ar: 'الإباضة', en: 'Ovulation' } },
  luteal: { emoji: '', title: { ar: 'المرحلة الأصفرية', en: 'Luteal phase' } },
};

export function CycleResourceCard({
  phase,
  className = '',
  subtitle = 'مصادر تعليمية لصحتكِ',
  locale = 'ar',
}: CycleResourceCardProps): JSX.Element {
  const resources = RESOURCES[phase];
  const label = PHASE_LABELS[phase];

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{label.emoji}</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">
            {label.title[locale]}
          </h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {resources.map((r) => (
          <div
            key={r.title.ar}
            className="flex items-start gap-2 rounded-lg bg-purple-50 px-3 py-2.5 dark:bg-purple-950"
          >
            <span className="text-sm shrink-0">{r.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-purple-800 dark:text-purple-200">
                {r.title[locale]}
              </p>
              <p className="text-[9px] text-purple-600 dark:text-purple-400">{r.detail[locale]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
