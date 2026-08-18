'use client';

import { cn } from '@galaxy/shared';

/**
 * Sensory Map Card — salon sensory zone map for neurodivergent-friendly navigation.
 * From Phase W8: Accessibility & Inclusivity — Neurodivergent-Friendly.
 *
 * Usage:
 *   <SensoryMapCard zones={['quiet', 'dim', 'bright', 'social']} />
 */

type ZoneType = 'quiet' | 'dim' | 'bright' | 'social' | 'private' | 'aromatherapy';

interface ZoneDef {
  emoji: string;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
  color: string;
}

const ZONES: Record<ZoneType, ZoneDef> = {
  quiet: {
    emoji: '',
    label: { ar: 'منطقة هادئة', en: 'Quiet zone' },
    description: { ar: 'موسيقى منخفضة، أحاديث قليلة', en: 'Low music, minimal conversation' },
    color: 'bg-sky-100 border-sky-300 dark:bg-sky-950 dark:border-sky-800',
  },
  dim: {
    emoji: '',
    label: { ar: 'إضاءة خافتة', en: 'Dim lighting' },
    description: { ar: 'أضواء دافئة وخافتة', en: 'Warm, dim lights' },
    color: 'bg-amber-100 border-amber-300 dark:bg-amber-950 dark:border-amber-800',
  },
  bright: {
    emoji: '️',
    label: { ar: 'إضاءة طبيعية', en: 'Natural light' },
    description: { ar: 'نوافذ كبيرة، إضاءة نهارية', en: 'Large windows, daylight' },
    color: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800',
  },
  social: {
    emoji: '',
    label: { ar: 'منطقة اجتماعية', en: 'Social zone' },
    description: {
      ar: 'مساحة مفتوحة للحديث والتواصل',
      en: 'Open space for talking and connecting',
    },
    color: 'bg-pink-100 border-pink-300 dark:bg-pink-950 dark:border-pink-800',
  },
  private: {
    emoji: '',
    label: { ar: 'غرفة خاصة', en: 'Private room' },
    description: { ar: 'غرفة منفصلة بخصوصية تامة', en: 'A separate room with full privacy' },
    color: 'bg-purple-100 border-purple-300 dark:bg-purple-950 dark:border-purple-800',
  },
  aromatherapy: {
    emoji: '',
    label: { ar: 'علاج بالروائح', en: 'Aromatherapy' },
    description: { ar: 'زيوت عطرية طبيعية مهدئة', en: 'Calming natural essential oils' },
    color: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800',
  },
};

interface SensoryMapCardProps {
  zones: ZoneType[];
  salonName?: string;
  className?: string;
  /** Header title */
  title?: string;
  /** Text after the salon name prefix */
  zoneNote?: string;
  /** Note shown under the zone grid */
  preferenceNote?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal zone data strings */
  locale?: 'ar' | 'en';
}

export function SensoryMapCard({
  zones,
  salonName,
  className = '',
  title = 'خريطة الصالون الحسية',
  zoneNote = 'اخترِي المنطقة التي تناسبكِ',
  preferenceNote = 'أخبرينا بالمنطقة التي تفضلينها عند الحجز — وسنجهزها لكِ',
  footerText = 'راحتكِ الحسية أولويتنا',
  locale = 'ar',
}: SensoryMapCardProps): JSX.Element | null {
  if (!zones.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">
            {salonName ? `${salonName} — ` : ''}
            {zoneNote}
          </p>
        </div>
      </div>

      {/* Zone grid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {zones.map((zone) => {
          const z = ZONES[zone];
          return (
            <div
              key={zone}
              className={cn(
                'rounded-xl border-2 p-3 text-center transition-all hover:shadow-sm',
                z.color,
              )}
            >
              <span className="text-2xl" aria-hidden="true">
                {z.emoji}
              </span>
              <p className="mt-1 text-[10px] font-bold text-text-primary dark:text-gray-100">
                {z.label[locale]}
              </p>
              <p className="text-[9px] text-text-secondary dark:text-gray-300">
                {z.description[locale]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Preference note */}
      <div className="mt-3 rounded-xl bg-purple-50 p-3 dark:bg-purple-950">
        <p className="text-center text-[10px] text-purple-700 dark:text-purple-300">
          {preferenceNote}
        </p>
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
