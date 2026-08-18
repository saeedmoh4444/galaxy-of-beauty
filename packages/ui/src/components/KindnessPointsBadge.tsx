'use client';

import { cn } from '@galaxy/shared';

/**
 * Kindness Points Badge — earn points for helping others.
 * From Phase W4: Sisterhood & Community — Celebrating Each Other.
 *
 * Usage:
 *   <KindnessPointsBadge points={340} level="generous" />
 */

type KindnessLevel = 'helper' | 'supporter' | 'generous' | 'angel';

interface LevelDef {
  emoji: string;
  title: { ar: string; en: string };
  minPoints: number;
  color: string;
  gradient: string;
}

const LEVELS: Record<KindnessLevel, LevelDef> = {
  helper: {
    emoji: '',
    title: { ar: 'مساعدة', en: 'Helper' },
    minPoints: 0,
    color: 'text-pink-600 dark:text-pink-300',
    gradient: 'from-pink-400 to-rose-400',
  },
  supporter: {
    emoji: '',
    title: { ar: 'داعمة', en: 'Supporter' },
    minPoints: 100,
    color: 'text-rose-600 dark:text-rose-300',
    gradient: 'from-rose-400 to-red-400',
  },
  generous: {
    emoji: '',
    title: { ar: 'كريمة', en: 'Generous' },
    minPoints: 300,
    color: 'text-purple-600 dark:text-purple-300',
    gradient: 'from-purple-400 to-violet-400',
  },
  angel: {
    emoji: '',
    title: { ar: 'ملاك', en: 'Angel' },
    minPoints: 1000,
    color: 'text-amber-600 dark:text-amber-300',
    gradient: 'from-amber-400 to-yellow-400',
  },
};

interface KindnessActivity {
  action: { ar: string; en: string };
  points: number;
}

const ACTIVITIES: KindnessActivity[] = [
  { action: { ar: 'الإجابة على سؤال أخت', en: "Answering a sister's question" }, points: 10 },
  { action: { ar: 'تقديم نصيحة مجانية', en: 'Giving free advice' }, points: 25 },
  { action: { ar: 'إرشاد أخت جديدة', en: 'Guiding a new sister' }, points: 50 },
  { action: { ar: 'تنظيم لقاء مجتمعي', en: 'Organizing a community meetup' }, points: 100 },
  { action: { ar: 'المساهمة في بنك الجمال', en: 'Contributing to the Beauty Bank' }, points: 200 },
];

interface KindnessPointsBadgeProps {
  points: number;
  level?: KindnessLevel;
  onViewRewards?: () => void;
  className?: string;
  /** Badge heading */
  title?: string;
  /** Suffix after the points number */
  pointsLabel?: string;
  /** Prefix before the next level name */
  reachPrefix?: string;
  /** Prefix before the remaining points count */
  remainingPrefix?: string;
  /** Suffix after the remaining points count */
  remainingSuffix?: string;
  /** Activity list heading */
  activityListTitle?: string;
  /** Rewards button label */
  buttonText?: string;
  /** Sisterhood footer message */
  footerText?: string;
  /** Display locale for level and activity labels */
  locale?: 'ar' | 'en';
}

export function KindnessPointsBadge({
  points,
  level,
  onViewRewards,
  className = '',
  title = 'نقاط اللطف',
  pointsLabel = 'نقطة',
  reachPrefix = 'للوصول إلى ',
  remainingPrefix = 'متبقي ',
  remainingSuffix = 'نقطة للترقية',
  activityListTitle = 'كيف تكسبين النقاط',
  buttonText = 'استبدلي نقاطكِ بمكافآت',
  footerText = 'كل نقطة تكتسبينها تعني أنكِ ساعدتِ أختاً',
  locale = 'ar',
}: KindnessPointsBadgeProps): JSX.Element {
  // Auto-detect level
  const detectedLevel: KindnessLevel =
    level ??
    (points >= 1000
      ? 'angel'
      : points >= 300
        ? 'generous'
        : points >= 100
          ? 'supporter'
          : 'helper');

  const levelDef = LEVELS[detectedLevel];

  // Progress to next level
  const levels: KindnessLevel[] = ['helper', 'supporter', 'generous', 'angel'];
  const currentIdx = levels.indexOf(detectedLevel);
  const nextLevel = currentIdx < levels.length - 1 ? levels[currentIdx + 1] : null;
  const nextDef = nextLevel ? LEVELS[nextLevel] : null;
  const progressToNext = nextDef
    ? Math.min(
        100,
        Math.round(
          ((points - levelDef.minPoints) / (nextDef.minPoints - levelDef.minPoints)) * 100,
        ),
      )
    : 100;

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-5 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Level header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-xl text-white',
              levelDef.gradient,
            )}
          >
            {levelDef.emoji}
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">{title}</h4>
            <p className={cn('text-[10px] font-medium', levelDef.color)}>
              {levelDef.emoji} {levelDef.title[locale]}
            </p>
          </div>
        </div>

        {/* Points display */}
        <div className="text-center">
          <p className="text-xl font-bold text-pink-700 dark:text-pink-300">
            {points.toLocaleString('ar-SA')}
          </p>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{pointsLabel}</p>
        </div>
      </div>

      {/* Progress to next level */}
      {nextDef && (
        <div className="mt-3 rounded-xl bg-pink-50 p-2.5 dark:bg-pink-950">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-secondary dark:text-gray-300">
              {reachPrefix}
              {nextDef.title[locale]}
            </span>
            <span className="font-bold text-pink-700 dark:text-pink-300">{progressToNext}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-pink-100 dark:bg-pink-900">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r transition-all',
                nextDef.gradient,
              )}
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <p className="mt-1 text-[9px] text-text-tertiary dark:text-gray-500">
            {remainingPrefix}
            {nextDef.minPoints - points} {remainingSuffix}
          </p>
        </div>
      )}

      {/* Activity list */}
      <div className="mt-3 space-y-1">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
          {activityListTitle}
        </p>
        {ACTIVITIES.map((a) => (
          <div
            key={a.action.ar}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 dark:bg-gray-800"
          >
            <span className="text-[10px] text-text-secondary dark:text-gray-300">
              {a.action[locale]}
            </span>
            <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400">
              +{a.points}
            </span>
          </div>
        ))}
      </div>

      {/* Rewards CTA */}
      <button
        type="button"
        onClick={onViewRewards}
        className="mt-3 w-full rounded-xl border border-pink-200 bg-pink-50 py-2 text-xs font-bold text-pink-700 hover:bg-pink-100 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300 transition-colors"
      >
        {buttonText}
      </button>

      {/* Sisterhood message */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
