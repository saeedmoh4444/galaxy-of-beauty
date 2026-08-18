'use client';
import { api } from '@/lib/trpc';
import { Card, KPIRowSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const MEMBERSHIPS: {
  key: string;
  emoji: string;
  name: TranslationKey;
  price: number;
  color: string;
  benefits: TranslationKey[];
  notIncluded: TranslationKey[];
}[] = [
  {
    key: 'basic',
    emoji: '',
    name: 'membership.tier.basic',
    price: 0,
    color: '#9ca3af',
    benefits: [
      'membership.benefit.basic1',
      'membership.benefit.basic2',
      'membership.benefit.basic3',
    ],
    notIncluded: [
      'membership.notIncluded.basic1',
      'membership.notIncluded.basic2',
      'membership.notIncluded.basic3',
    ],
  },
  {
    key: 'premium',
    emoji: '',
    name: 'membership.tier.premium',
    price: 99,
    color: '#f59e0b',
    benefits: [
      'membership.benefit.premium1',
      'membership.benefit.premium2',
      'membership.benefit.premium3',
      'membership.benefit.premium4',
      'membership.benefit.premium5',
      'membership.benefit.premium6',
    ],
    notIncluded: [],
  },
  {
    key: 'platinum',
    emoji: '',
    name: 'membership.tier.platinum',
    price: 299,
    color: '#7c3aed',
    benefits: [
      'membership.benefit.platinum1',
      'membership.benefit.platinum2',
      'membership.benefit.platinum3',
      'membership.benefit.platinum4',
      'membership.benefit.platinum5',
      'membership.benefit.platinum6',
      'membership.benefit.platinum7',
      'membership.benefit.platinum8',
    ],
    notIncluded: [],
  },
];

export default function SalonMembershipPage(): JSX.Element {
  const { t } = useLocale();
  const { data: membership, isLoading } = api.salonMembership.myMembership.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const subscribeMut = api.salonMembership.subscribe.useMutation();
  const cancelMut = api.salonMembership.cancel.useMutation();

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('membership.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('membership.subtitle')}</p>
        </div>
        {isLoading ? (
          <KPIRowSkeleton count={1} />
        ) : (
          (membership?.tier as string) && (
            <Card padding="lg" className="text-center border-2 border-purple-300">
              <p className="text-sm text-text-secondary">{t('membership.currentTier')}</p>
              <p className="text-3xl font-extrabold text-purple-600 mt-1">
                {(membership?.tier as string) === 'platinum'
                  ? t('membership.tier.platinumShort')
                  : (membership?.tier as string) === 'premium'
                    ? t('membership.tier.premiumShort')
                    : t('membership.tier.basicShort')}
              </p>
              {(membership?.autoRenew as boolean) && (
                <Button
                  variant="ghost"
                  onClick={() => cancelMut.mutate()}
                  className="mt-3 text-red-500"
                >
                  {t('membership.cancelAutoRenew')}
                </Button>
              )}
            </Card>
          )
        )}
        <div className="grid gap-6 lg:grid-cols-3">
          {MEMBERSHIPS.map((m) => (
            <Card key={m.key} padding="lg" className="text-center">
              <span className="text-5xl">{m.emoji}</span>
              <h2 className="text-xl font-bold mt-2" style={{ color: m.color }}>
                {t(m.name)}
              </h2>
              <p className="text-2xl font-extrabold mt-1">
                {m.price === 0
                  ? t('membership.free')
                  : t('membership.perMonth', { price: formatCurrency(m.price) })}
              </p>
              <div className="mt-4 space-y-2 text-sm text-right">
                <p className="font-semibold text-text-primary">{t('membership.benefitsTitle')}</p>
                {m.benefits.map((b, i) => (
                  <p key={i} className="text-green-600">
                    {t(b)}
                  </p>
                ))}
                {m.notIncluded.length > 0 && (
                  <>
                    <p className="font-semibold text-text-tertiary mt-3">
                      {t('membership.notIncludedTitle')}
                    </p>
                    {m.notIncluded.map((b, i) => (
                      <p key={i} className="text-text-tertiary">
                        {t(b)}
                      </p>
                    ))}
                  </>
                )}
                <Button
                  onClick={() => subscribeMut.mutate({ tier: m.key, autoRenew: true })}
                  loading={subscribeMut.isPending}
                  className="w-full mt-4"
                >
                  {m.price === 0 ? t('membership.free') : t('membership.subscribe')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
