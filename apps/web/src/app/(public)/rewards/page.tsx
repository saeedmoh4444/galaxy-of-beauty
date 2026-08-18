import { getServerCaller } from '@/lib/server-trpc';
import type { RouterOutputs } from '@galaxy/api';
import { Card } from '@galaxy/ui';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';
import type { TranslationKey } from '@galaxy/shared';

const TIER_LABELS: Record<string, { name: TranslationKey; emoji: string; color: string }> = {
  SILVER: { name: 'marketing.rewards.tier-silver', emoji: '', color: 'from-gray-300 to-gray-400' },
  GOLD: { name: 'marketing.rewards.tier-gold', emoji: '', color: 'from-yellow-400 to-amber-500' },
  PLATINUM: {
    name: 'marketing.rewards.tier-platinum',
    emoji: '',
    color: 'from-purple-400 to-indigo-500',
  },
};

export default async function RewardsPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  let rewards: RouterOutputs['loyalty']['rewards'] = [];
  try {
    const caller = await getServerCaller();
    rewards = await caller.loyalty.rewards();
  } catch {
    /* empty */
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.rewards.title', locale)}
        </h1>
        <p className="mt-2 text-text-secondary">{t('marketing.rewards.subtitle', locale)}</p>
      </div>

      {/* Tiers */}
      <div className="grid gap-6 sm:grid-cols-3 mb-12">
        {Object.entries(TIER_LABELS).map(([key, tier]) => (
          <Card
            key={key}
            padding="lg"
            className={`bg-gradient-to-br ${tier.color} text-white text-center`}
          >
            <span className="text-4xl">{tier.emoji}</span>
            <h3 className="mt-2 text-xl font-bold">{t(tier.name, locale)}</h3>
            <p className="text-sm opacity-80">
              {key === 'SILVER'
                ? t('marketing.rewards.tier-silver-desc', locale)
                : key === 'GOLD'
                  ? t('marketing.rewards.tier-gold-desc', locale)
                  : t('marketing.rewards.tier-platinum-desc', locale)}
            </p>
          </Card>
        ))}
      </div>

      {/* Rewards */}
      <h2 className="text-xl font-bold mb-6 text-text-primary dark:text-gray-100">
        {t('marketing.rewards.rewards-title', locale)}
      </h2>
      {rewards.length === 0 ? (
        <p className="text-center text-text-tertiary">
          {t('marketing.rewards.no-rewards', locale)}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((r) => {
            const name = (r.nameJson as Record<string, string>)?.ar || '';
            const desc = (r.descriptionJson as Record<string, string>)?.ar || '';
            return (
              <Card key={r.id} padding="lg" className="relative">
                <div className="absolute top-3 left-3 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                  {t('marketing.rewards.points-cost', locale, { points: r.pointsCost })}
                </div>
                <div className="text-center pt-4">
                  <span className="text-4xl">
                    {r.rewardType === 'discount_percent'
                      ? '️'
                      : r.rewardType === 'free_service'
                        ? ''
                        : ''}
                  </span>
                  <h3 className="mt-3 text-lg font-bold">{name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{desc}</p>
                  <div className="mt-4">
                    <span className="text-2xl font-extrabold text-brand-600">
                      {r.rewardType === 'discount_percent'
                        ? `${Number(r.rewardValue)}%`
                        : t('marketing.rewards.reward-value', locale, {
                            value: Number(r.rewardValue),
                          })}
                    </span>
                  </div>
                  {r.minTier && r.minTier !== 'SILVER' && (
                    <p className="mt-2 text-xs text-amber-600">
                      {t('marketing.rewards.tier-requirement', locale, {
                        tier: t(TIER_LABELS[r.minTier]?.name ?? '', locale),
                      })}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
