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
  title: string;
  detail: string;
}

const RESOURCES: Record<CyclePhase, Resource[]> = {
  menstrual: [
    { emoji: '🩸', title: 'فهم الدورة', detail: 'الجسم يتخلص من بطانة الرحم — طبيعي تماماً' },
    { emoji: '', title: 'تغذية', detail: 'أطعمة غنية بالحديد: سبانخ، عدس، لحم أحمر' },
    { emoji: '', title: 'حركة', detail: 'مشي خفيف ويوغا لطيفة — لا تمارين قاسية' },
  ],
  follicular: [
    { emoji: '', title: 'طاقة متجددة', detail: 'الإستروجين يرتفع — طاقتكِ في الذروة' },
    { emoji: '', title: 'تغذية', detail: 'بروتينات خفيفة وخضروات طازجة' },
    { emoji: '', title: 'حركة', detail: 'أفضل وقت للتمارين القوية والنشاط' },
  ],
  ovulation: [
    { emoji: '', title: 'إشراقة', detail: 'البشرة في أفضل حالاتها — وقت المناسبات' },
    { emoji: '', title: 'ترطيب', detail: 'اشربي ماء كثيراً — بشرتكِ تشكركِ' },
    { emoji: '', title: 'ثقة', detail: 'أعلى درجات الثقة — وقت التصوير والمناسبات' },
  ],
  luteal: [
    { emoji: '', title: 'استعداد', detail: 'الجسم يستعد للدورة القادمة — خذي الأمور بهدوء' },
    { emoji: '', title: 'تغذية', detail: 'مغنيسيوم: مكسرات، موز، شوكولاتة داكنة' },
    { emoji: '', title: 'استرخاء', detail: 'حمام دافئ، تأمل، قراءة — دللي نفسكِ' },
  ],
};

interface CycleResourceCardProps {
  phase: CyclePhase;
  className?: string;
}

const PHASE_LABELS: Record<CyclePhase, { emoji: string; title: string }> = {
  menstrual: { emoji: '🩸', title: 'الدورة الشهرية' },
  follicular: { emoji: '', title: 'المرحلة الجرابية' },
  ovulation: { emoji: '', title: 'الإباضة' },
  luteal: { emoji: '', title: 'المرحلة الأصفرية' },
};

export function CycleResourceCard({ phase, className = '' }: CycleResourceCardProps): JSX.Element {
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
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{label.title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">مصادر تعليمية لصحتكِ</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {resources.map((r) => (
          <div
            key={r.title}
            className="flex items-start gap-2 rounded-lg bg-purple-50 px-3 py-2.5 dark:bg-purple-950"
          >
            <span className="text-sm shrink-0">{r.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-purple-800 dark:text-purple-200">
                {r.title}
              </p>
              <p className="text-[9px] text-purple-600 dark:text-purple-400">{r.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
