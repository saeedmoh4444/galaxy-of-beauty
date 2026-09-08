/**
 * E6a — life-stage journeys. Stage definitions + the pamper window math
 * shared by the lifeStage router and the wellness-hub UIs.
 * Pure data/helpers — no JSX, no server imports.
 */

export const LIFE_STAGE_KEYS = ['bride', 'trying', 'pregnant', 'new_mom', 'back_to_me'] as const;
export type LifeStageKey = (typeof LIFE_STAGE_KEYS)[number];

export interface LifeStageDefinition {
  key: LifeStageKey;
  emoji: string;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  /** Feature links surfaced on the stage home (href + i18n key). */
  links: Array<{ href: string; key: string }>;
}

export const LIFE_STAGES: LifeStageDefinition[] = [
  {
    key: 'bride',
    emoji: '👰',
    nameAr: 'عروس',
    nameEn: 'Bride',
    taglineAr: 'كل ما تحتاجينه ليومك الكبير في مكان واحد',
    taglineEn: 'Everything for your big day in one place',
    links: [
      { href: '/bridal-concierge', key: 'lifeStage.link.bridal' },
      { href: '/beauty-packages', key: 'lifeStage.link.packages' },
      { href: '/campaigns', key: 'lifeStage.link.campaigns' },
    ],
  },
  {
    key: 'trying',
    emoji: '🌱',
    nameAr: 'رحلة الأمومة',
    nameEn: 'Trying',
    taglineAr: 'تتبعي دورتكِ ونافذة الخصوبة بدقة',
    taglineEn: 'Track your cycle and fertile window precisely',
    links: [
      { href: '/cycle-tracker', key: 'lifeStage.link.cycle' },
      { href: '/clinics', key: 'lifeStage.link.clinics' },
      { href: '/wellness-hub', key: 'lifeStage.link.hub' },
    ],
  },
  {
    key: 'pregnant',
    emoji: '🤰',
    nameAr: 'حامل',
    nameEn: 'Pregnant',
    taglineAr: 'خدمات آمنة للحمل ورعاية مخصصة لكِ',
    taglineEn: 'Pregnancy-safe services and dedicated care',
    links: [
      { href: '/cycle-tracker', key: 'lifeStage.link.cycle' },
      { href: '/clinics', key: 'lifeStage.link.clinics' },
      { href: '/wellness-hub', key: 'lifeStage.link.hub' },
    ],
  },
  {
    key: 'new_mom',
    emoji: '🍼',
    nameAr: 'أم جديدة',
    nameEn: 'New mom',
    taglineAr: 'صوالين ودعم صديق للأمهات',
    taglineEn: 'Mommy-friendly salons and support',
    links: [
      { href: '/search', key: 'lifeStage.link.search' },
      { href: '/wellness-hub', key: 'lifeStage.link.hub' },
      { href: '/stores', key: 'lifeStage.link.stores' },
    ],
  },
  {
    key: 'back_to_me',
    emoji: '💗',
    nameAr: 'وقتي لنفسي',
    nameEn: 'Back to me',
    taglineAr: 'اهتمامي يبدأ مني — جمال وصحة وعافية',
    taglineEn: 'Self-care first — beauty, health and wellness',
    links: [
      { href: '/wellness-hub', key: 'lifeStage.link.hub' },
      { href: '/discover', key: 'lifeStage.link.discover' },
      { href: '/beauty-packages', key: 'lifeStage.link.packages' },
    ],
  },
];

export function getLifeStageDefinition(key: string | null | undefined): LifeStageDefinition {
  return LIFE_STAGES.find((s) => s.key === key) ?? LIFE_STAGES[4]!;
}

/** Pamper window: the predicted period starts within 3 days, or we are on
 *  period days 1–3. */
export function isPamperWindow(input: {
  daysUntilNext: number | null;
  currentDay: number;
  hasSettings: boolean;
}): boolean {
  if (!input.hasSettings) return false;
  if (input.daysUntilNext !== null && input.daysUntilNext <= 3) return true;
  return input.currentDay <= 3;
}
