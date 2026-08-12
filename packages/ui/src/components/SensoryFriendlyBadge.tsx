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
  label: string;
  description: string;
}

const FEATURES: FeatureDef[] = [
  {
    key: 'dim_lights',
    emoji: '💡',
    label: 'إضاءة هادئة',
    description: 'إضاءة خافتة ومريحة للعين',
  },
  {
    key: 'quiet_music',
    emoji: '🎵',
    label: 'موسيقى منخفضة',
    description: 'موسيقى هادئة أو إيقافها تماماً',
  },
  {
    key: 'no_fragrance',
    emoji: '🌿',
    label: 'بدون عطور قوية',
    description: 'منتجات خالية من العطور القوية',
  },
  {
    key: 'silent_appointment',
    emoji: '🤫',
    label: 'موعد صامت',
    description: 'بدون أحاديث جانبية إلا إذا بدأتِ أنتِ',
  },
  {
    key: 'comfort_kit',
    emoji: '🧸',
    label: 'حقيبة راحة',
    description: 'سماعات عازلة للضوضاء، ألعاب حسية، بطانية ثقيلة',
  },
  {
    key: 'predictable_service',
    emoji: '📋',
    label: 'خدمة متوقعة',
    description: 'شرح كل خطوة قبل البدء بها',
  },
  {
    key: 'private_room',
    emoji: '🚪',
    label: 'غرفة خاصة',
    description: 'غرفة منفصلة بعيداً عن الضوضاء',
  },
  {
    key: 'extra_time',
    emoji: '⏰',
    label: 'وقت إضافي',
    description: 'وقت إضافي 15-30 دقيقة بدون استعجال',
  },
];

interface SensoryFriendlyBadgeProps {
  /** List of sensory-friendly features this salon offers */
  features: SensoryFeature[];
  /** Show expanded detail view */
  expanded?: boolean;
  className?: string;
}

export function SensoryFriendlyBadge({
  features,
  expanded: initialExpanded = false,
  className = '',
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
          <span className="text-lg" aria-hidden="true">
            🧠
          </span>
          <div>
            <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">صديق للحواس</h4>
            <p className="text-[10px] text-purple-500 dark:text-purple-400">
              {active.length} خيارات حسية متوفرة
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
            title={f.description}
          >
            <span aria-hidden="true">{f.emoji}</span>
            {f.label}
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
                  {f.label}
                </p>
                <p className="text-[10px] text-text-tertiary dark:text-gray-400">{f.description}</p>
              </div>
            </div>
          ))}

          <p className="!mt-3 text-[10px] leading-relaxed text-purple-500 dark:text-purple-400">
            💜 نحن نهتم براحتكِ الحسية. أخبرينا باحتياجاتكِ عند الحجز وسنقوم بتجهيز كل شيء مسبقاً.
          </p>
        </div>
      )}
    </div>
  );
}
