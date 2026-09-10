'use client';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { localize, prioritizeByLinks } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import {
  Card,
  GridSkeleton,
  formatCurrency,
  ErrorAlert,
  HeroSection,
  Reveal,
  ServiceImage,
} from '@galaxy/ui';

const FEATURES = [
  {
    title: 'marketing.discover.services',
    desc: 'marketing.discover.services-desc',
    href: '/services',
    image: 'spa',
  },
  {
    title: 'marketing.discover.technicians',
    desc: 'marketing.discover.technicians-desc',
    href: '/technicians',
    image: 'makeup',
  },
  {
    title: 'marketing.discover.shop-the-look',
    desc: 'marketing.discover.shop-the-look-desc',
    href: '/shop-the-look',
    image: 'eveningMakeup',
  },
  {
    title: 'marketing.discover.lookbook',
    desc: 'marketing.discover.lookbook-desc',
    href: '/lookbook',
    image: 'bridalMakeup',
  },
  {
    title: 'marketing.discover.beauty-fortune',
    desc: 'marketing.discover.beauty-fortune-desc',
    href: '/beauty-fortune',
    image: 'aromatherapy',
  },
  {
    title: 'marketing.discover.beauty-quiz',
    desc: 'marketing.discover.beauty-quiz-desc',
    href: '/beauty-quiz',
    image: 'facial',
  },
  {
    title: 'marketing.discover.bundles',
    desc: 'marketing.discover.bundles-desc',
    href: '/bundles',
    image: 'bridalPackage',
  },
  {
    title: 'marketing.discover.beauty-packages',
    desc: 'marketing.discover.beauty-packages-desc',
    href: '/beauty-packages',
    image: 'massage',
  },
  {
    title: 'marketing.discover.bridal-concierge',
    desc: 'marketing.discover.bridal-concierge-desc',
    href: '/bridal-concierge',
    image: 'engagement',
  },
  {
    title: 'marketing.discover.mommy-and-me',
    desc: 'marketing.discover.mommy-and-me-desc',
    href: '/mommy-and-me',
    image: 'deepCleansing',
  },
  {
    title: 'marketing.discover.flash-deals',
    desc: 'marketing.discover.flash-deals-desc',
    href: '/flash-deals',
    image: 'manicure',
  },
  {
    title: 'marketing.discover.campaigns',
    desc: 'marketing.discover.campaigns-desc',
    href: '/campaigns',
    image: 'blowout',
  },
  {
    title: 'marketing.discover.blog',
    desc: 'marketing.discover.blog-desc',
    href: '/blog',
    image: 'antiAging',
  },
  {
    title: 'marketing.discover.community',
    desc: 'marketing.discover.community-desc',
    href: '/community',
    image: 'lashes',
  },
  {
    title: 'marketing.discover.events',
    desc: 'marketing.discover.events-desc',
    href: '/events',
    image: 'hairStyling',
  },
  {
    title: 'marketing.discover.challenges',
    desc: 'marketing.discover.challenges-desc',
    href: '/challenges',
    image: 'bodyScrub',
  },
  {
    title: 'marketing.discover.rewards',
    desc: 'marketing.discover.rewards-desc',
    href: '/rewards',
    image: 'hotStone',
  },
  {
    title: 'marketing.discover.gift-guide',
    desc: 'marketing.discover.gift-guide-desc',
    href: '/gift-guide',
    image: 'bridalHenna',
  },
  {
    title: 'marketing.discover.price-estimator',
    desc: 'marketing.discover.price-estimator-desc',
    href: '/price-estimator',
    image: 'hairColor',
  },
  {
    title: 'marketing.discover.onboarding',
    desc: 'marketing.discover.onboarding-desc',
    href: '/onboarding',
    image: 'beautyService',
  },
  {
    title: 'marketing.discover.search',
    desc: 'marketing.discover.search-desc',
    href: '/search',
    image: 'pedicure',
  },
  {
    title: 'marketing.discover.marketplace',
    desc: 'marketing.discover.marketplace-desc',
    href: '/marketplace',
    image: 'nailArt',
  },
  {
    title: 'marketing.discover.subscription-boxes',
    desc: 'marketing.discover.subscription-boxes-desc',
    href: '/subscription-boxes',
    image: 'bodyWrap',
  },
] as const;

export default function DiscoverPage(): JSX.Element {
  const { t } = useLocale();

  // Stage-aware ordering (Phase 3 sprint 1): the life stage's quick links
  // surface first. back_to_me (guests/default) keeps the canonical order.
  const greetingQ = api.lifeStage.homeGreeting.useQuery();
  const greeting = greetingQ.data as
    { stage: string; links?: Array<{ href: string; key: string }> } | undefined;
  const stage = greeting?.stage ?? 'back_to_me';
  const links = greeting?.links ?? [];
  const ordered =
    stage !== 'back_to_me' && links.length > 0
      ? prioritizeByLinks(
          FEATURES,
          links.map((l) => l.href),
        )
      : FEATURES;

  return (
    <div>
      <HeroSection
        align="center"
        eyebrow="✨"
        title={t('marketing.discover.header-title')}
        subtitle={t('marketing.discover.header-subtitle')}
        gradient="from-brand-50 via-surface to-accent-50"
        className="mb-2"
      />
      <div className="mx-auto max-w-6xl px-4 pb-12">
        <div
          data-testid="discover-grid"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {ordered.map((f, i) => (
            <Reveal key={f.href} delay={(i % 4) * 60} className="h-full">
              <Link href={f.href} className="block h-full">
                <Card hover padding="md" className="h-full">
                  <div className="h-24 overflow-hidden rounded-xl">
                    <ServiceImage service={f.image} size="full" alt={t(f.title)} />
                  </div>
                  <h3 className="mt-3 font-bold text-sm text-text-primary dark:text-gray-100">
                    {t(f.title)}
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary dark:text-text-tertiary">
                    {t(f.desc)}
                  </p>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>

        <TrendingNow />
      </div>
    </div>
  );
}

function TrendingNow(): JSX.Element {
  const { t, locale } = useLocale();
  const {
    data: trending,
    isLoading,
    isError,
    refetch,
  } = api.social.trending.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  if (isError)
    return (
      <div className="py-4">
        <ErrorAlert message={t('marketing.discover.trending-error')} onRetry={() => refetch()} />
      </div>
    );
  if (!(trending ?? []).length && !isLoading) return <></>;
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t('marketing.discover.trending-title')}
      </h2>
      {isLoading ? (
        <GridSkeleton count={8} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(trending ?? []).slice(0, 8).map((s: Record<string, unknown>) => (
            <Link key={s.id as number} href={`/services/${s.id}`}>
              <Card hover padding="md" className="text-center">
                <span className="text-2xl"></span>
                <p className="font-bold text-sm mt-2">{localize(s.titleJson, locale)}</p>
                <p className="text-xs text-brand-600 mt-1">
                  {formatCurrency(Number(s.basePrice ?? 0))}
                </p>
                <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                  {t('marketing.discover.bookings-count', { count: s.bookingCount as number })}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
