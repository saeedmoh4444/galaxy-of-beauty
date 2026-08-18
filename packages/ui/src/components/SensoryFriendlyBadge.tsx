'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Sensory-Friendly Badge — signals sensory-sensitive options at partner salons.
 * From Phase W8: Accessibility & Inclusivity — Neurodivergent-Friendly.
 *
 * Usage:
 *   <SensoryFriendlyBadge features={['dim_lights', 'quiet_music', 'silent_appointment']} />
 */

type SensoryFeature =
  | 'dim_lights'
  | 'quiet_music'
  | 'no_fragrance'
  | 'silent_appointment'
  | 'comfort_kit'
  | 'predictable_service'
  | 'private_room'
  | 'extra_time';

interface FeatureDef {
  key: SensoryFeature;
  emoji: string;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
}

const FEATURES: FeatureDef[] = [
  {
    key: 'dim_lights',
    emoji: '',
    label: { ar: 'إضاءة هادئة', en: 'Dim lighting' },
    description: { ar: 'إضاءة خافتة ومريحة للعين', en: 'Soft, eye-comfortable lighting' },
  },
  {
    key: 'quiet_music',
    emoji: '',
    label: { ar: 'موسيقى منخفضة', en: 'Low music' },
    description: { ar: 'موسيقى هادئة أو إيقافها تماماً', en: 'Quiet music or none at all' },
  },
  {
    key: 'no_fragrance',
    emoji: '',
    label: { ar: 'بدون عطور قوية', en: 'No strong fragrances' },
    description: { ar: 'منتجات خالية من العطور القوية', en: 'Products free of strong scents' },
  },
  {
    key: 'silent_appointment',
    emoji: '',
    label: { ar: 'موعد صامت', en: 'Silent appointment' },
    description: {
      ar: 'بدون أحاديث جانبية إلا إذا بدأتِ أنتِ',
      en: 'No small talk unless you start it',
    },
  },
  {
    key: 'comfort_kit',
    emoji: '',
    label: { ar: 'حقيبة راحة', en: 'Comfort kit' },
    description: {
      ar: 'سماعات عازلة للضوضاء، ألعاب حسية، بطانية ثقيلة',
      en: 'Noise-cancelling headphones, sensory toys, weighted blanket',
    },
  },
  {
    key: 'predictable_service',
    emoji: '',
    label: { ar: 'خدمة متوقعة', en: 'Predictable service' },
    description: { ar: 'شرح كل خطوة قبل البدء بها', en: 'Every step explained before it begins' },
  },
  {
    key: 'private_room',
    emoji: '',
    label: { ar: 'غرفة خاصة', en: 'Private room' },
    description: { ar: 'غرفة منفصلة بعيداً عن الضوضاء', en: 'A separate room away from noise' },
  },
  {
    key: 'extra_time',
    emoji: '',
    label: { ar: 'وقت إضافي', en: 'Extra time' },
    description: {
      ar: 'وقت إضافي 15-30 دقيقة بدون استعجال',
      en: '15-30 extra minutes with no rush',
    },
  },
];

interface SensoryFriendlyBadgeProps {
  /** List of sensory-friendly features this salon offers */
  features: SensoryFeature[];
  /** Show expanded detail view */
  expanded?: boolean;
  className?: string;
  /** Header title */
  title?: string;
  /** Text after the features count */
  optionsText?: string;
  /** Note shown in the expanded view */
  expandedNote?: string;
  /** Locale for internal feature data strings */
  locale?: 'ar' | 'en';
}

export function SensoryFriendlyBadge({
  features,
  expanded: initialExpanded = false,
  className = '',
  title = 'صديق للحواس',
  optionsText = 'خيارات حسية متوفرة',
  expandedNote = 'نحن نهتم براحتكِ الحسية. أخبرينا باحتياجاتكِ عند الحجز وسنقوم بتجهيز كل شيء مسبقاً.',
  locale = 'ar',
}: SensoryFriendlyBadgeProps): JSX.Element | null {
  const [expanded, setExpanded] = useState(initialExpanded);

  if (!features.length) return null;

  const active = FEATURES.filter((f) => features.includes(f.key));

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true"></span>
          <div>
            <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
            <p className="text-[10px] text-purple-500 dark:text-purple-400">
              {active.length} {optionsText}
            </p>
          </div>
        </div>
        <svg
          className={cn(
            'h-4 w-4 text-purple-400 transition-transform duration-200',
            expanded && 'rotate-180',
          )}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Compact feature chips — always visible */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {active.map((f) => (
          <span
            key={f.key}
            className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300"
            title={f.description[locale]}
          >
            <span aria-hidden="true">{f.emoji}</span>
            {f.label[locale]}
          </span>
        ))}
      </div>

      {/* Expanded detail — toggled */}
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-purple-50 pt-3 dark:border-purple-900">
          {active.map((f) => (
            <div key={f.key} className="flex items-start gap-2">
              <span className="mt-0.5 text-sm" aria-hidden="true">
                {f.emoji}
              </span>
              <div>
                <p className="text-xs font-semibold text-text-primary dark:text-gray-100">
                  {f.label[locale]}
                </p>
                <p className="text-[10px] text-text-tertiary dark:text-gray-400">
                  {f.description[locale]}
                </p>
              </div>
            </div>
          ))}

          <p className="!mt-3 text-[10px] leading-relaxed text-purple-500 dark:text-purple-400">
            {expandedNote}
          </p>
        </div>
      )}
    </div>
  );
}
