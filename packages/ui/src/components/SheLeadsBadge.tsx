'use client';

import { cn } from '@galaxy/shared';

/**
 * She Leads Badge — recognizes women in beauty leadership.
 * From Phase W10: Saudi Women Leadership — "She Leads" Program.
 *
 * Usage:
 *   <SheLeadsBadge role="franchise_owner" name="نورة" />
 */

type LeadershipRole =
  | 'franchise_owner'
  | 'salon_manager'
  | 'master_technician'
  | 'academy_instructor'
  | 'mentor'
  | 'advisory_board'
  | 'community_leader'
  | 'top_earner';

interface RoleDef {
  emoji: string;
  title: string;
  description: string;
  tier: 'gold' | 'silver' | 'bronze';
}

const ROLES: Record<LeadershipRole, RoleDef> = {
  franchise_owner: {
    emoji: '',
    title: 'مالكة امتياز',
    description: 'تملك وتدير فرعها الخاص من جالاكسي بيوتي',
    tier: 'gold',
  },
  salon_manager: {
    emoji: '',
    title: 'مديرة صالون',
    description: 'تقود فريقاً من الخبيرات في صالونها',
    tier: 'silver',
  },
  master_technician: {
    emoji: '',
    title: 'خبيرة رئيسية',
    description: 'أعلى مستوى من المهارة والخبرة',
    tier: 'gold',
  },
  academy_instructor: {
    emoji: '',
    title: 'مدربة أكاديمية',
    description: 'تعلّم الجيل القادم من خبيرات التجميل',
    tier: 'silver',
  },
  mentor: {
    emoji: '',
    title: 'مرشدة',
    description: 'تشارك خبرتها مع الأخت الصغرى في برنامج الإرشاد',
    tier: 'bronze',
  },
  advisory_board: {
    emoji: '️',
    title: 'المجلس الاستشاري',
    description: 'قائدة في مجال التجميل والأعمال والتقنية',
    tier: 'gold',
  },
  community_leader: {
    emoji: '',
    title: 'قائدة مجتمعية',
    description: 'تنظم فعاليات المجتمع وتدعم الأخوات',
    tier: 'bronze',
  },
  top_earner: {
    emoji: '',
    title: 'الأعلى دخلاً',
    description: 'من بين الأعلى دخلاً على المنصة هذا الشهر',
    tier: 'gold',
  },
};

const TIER_STYLES: Record<RoleDef['tier'], string> = {
  gold: 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 dark:border-amber-800 dark:from-amber-950 dark:to-yellow-950',
  silver:
    'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 dark:border-gray-700 dark:from-gray-900 dark:to-slate-900',
  bronze:
    'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-800 dark:from-orange-950 dark:to-amber-950',
};

const TIER_BADGE: Record<RoleDef['tier'], { emoji: string; label: string; className: string }> = {
  gold: {
    emoji: '',
    label: 'ذهبي',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  silver: {
    emoji: '',
    label: 'فضي',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  bronze: {
    emoji: '',
    label: 'برونزي',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
};

interface SheLeadsBadgeProps {
  role: LeadershipRole;
  name: string;
  /** "الرياض", "جدة" etc */
  city?: string;
  /** Years of experience */
  yearsOfExperience?: number;
  /** Team size for managers */
  teamSize?: number;
  /** Show expanded detail */
  expanded?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function SheLeadsBadge({
  role,
  name,
  city,
  yearsOfExperience,
  teamSize,
  size = 'md',
  className = '',
}: SheLeadsBadgeProps): JSX.Element {
  const roleDef = ROLES[role];
  const tier = TIER_BADGE[roleDef.tier];
  const isSm = size === 'sm';

  return (
    <div
      className={cn('rounded-2xl border p-4', TIER_STYLES[roleDef.tier], isSm && 'p-3', className)}
    >
      {/* Top row: role emoji + tier badge */}
      <div className="flex items-center justify-between">
        <span className={cn('shrink-0', isSm ? 'text-xl' : 'text-2xl')} aria-hidden="true">
          {roleDef.emoji}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
            tier.className,
          )}
        >
          {tier.emoji} {tier.label}
        </span>
      </div>

      {/* Name + title */}
      <div className="mt-2">
        <h4
          className={cn(
            'font-bold text-text-primary dark:text-gray-100',
            isSm ? 'text-xs' : 'text-sm',
          )}
        >
          {name}
        </h4>
        <p className="text-[10px] font-medium text-text-tertiary dark:text-gray-400">
          {roleDef.emoji} {roleDef.title}
        </p>
      </div>

      {/* Description */}
      <p
        className={cn(
          'mt-1 text-text-secondary dark:text-gray-300',
          isSm ? 'text-[10px]' : 'text-xs',
        )}
      >
        {roleDef.description}
      </p>

      {/* Meta pills */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {city && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 text-[10px] dark:bg-black/20 dark:text-gray-300">
            {city}
          </span>
        )}
        {yearsOfExperience && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 text-[10px] dark:bg-black/20 dark:text-gray-300">
            ️ {yearsOfExperience} سنوات خبرة
          </span>
        )}
        {teamSize && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 text-[10px] dark:bg-black/20 dark:text-gray-300">
            فريق من {teamSize}
          </span>
        )}
      </div>

      {/* She Leads tagline */}
      <div className="mt-3 border-t border-amber-200 pt-2 dark:border-amber-800">
        <p className="text-center text-[9px] font-bold text-amber-700 dark:text-amber-400">
          She Leads — لأن القيادة تبدأ من الداخل
        </p>
      </div>
    </div>
  );
}
