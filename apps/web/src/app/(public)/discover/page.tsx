'use client';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { Card, GridSkeleton, formatCurrency, ErrorAlert } from '@galaxy/ui';

const FEATURES = [
  {
    emoji: '‍️',
    title: 'marketing.discover.services',
    desc: 'marketing.discover.services-desc',
    href: '/services',
    color: 'from-brand-100 to-brand-200',
  },
  {
    emoji: '‍',
    title: 'marketing.discover.technicians',
    desc: 'marketing.discover.technicians-desc',
    href: '/technicians',
    color: 'from-purple-100 to-purple-200',
  },
  {
    emoji: '️',
    title: 'marketing.discover.shop-the-look',
    desc: 'marketing.discover.shop-the-look-desc',
    href: '/shop-the-look',
    color: 'from-pink-100 to-pink-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.lookbook',
    desc: 'marketing.discover.lookbook-desc',
    href: '/lookbook',
    color: 'from-amber-100 to-amber-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.beauty-fortune',
    desc: 'marketing.discover.beauty-fortune-desc',
    href: '/beauty-fortune',
    color: 'from-rose-100 to-rose-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.beauty-quiz',
    desc: 'marketing.discover.beauty-quiz-desc',
    href: '/beauty-quiz',
    color: 'from-violet-100 to-violet-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.bundles',
    desc: 'marketing.discover.bundles-desc',
    href: '/bundles',
    color: 'from-green-100 to-green-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.beauty-packages',
    desc: 'marketing.discover.beauty-packages-desc',
    href: '/beauty-packages',
    color: 'from-cyan-100 to-cyan-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.bridal-concierge',
    desc: 'marketing.discover.bridal-concierge-desc',
    href: '/bridal-concierge',
    color: 'from-pink-100 to-rose-200',
  },
  {
    emoji: '‍',
    title: 'marketing.discover.mommy-and-me',
    desc: 'marketing.discover.mommy-and-me-desc',
    href: '/mommy-and-me',
    color: 'from-fuchsia-100 to-fuchsia-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.flash-deals',
    desc: 'marketing.discover.flash-deals-desc',
    href: '/flash-deals',
    color: 'from-red-100 to-red-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.campaigns',
    desc: 'marketing.discover.campaigns-desc',
    href: '/campaigns',
    color: 'from-orange-100 to-orange-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.blog',
    desc: 'marketing.discover.blog-desc',
    href: '/blog',
    color: 'from-blue-100 to-blue-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.community',
    desc: 'marketing.discover.community-desc',
    href: '/community',
    color: 'from-indigo-100 to-indigo-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.events',
    desc: 'marketing.discover.events-desc',
    href: '/events',
    color: 'from-teal-100 to-teal-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.challenges',
    desc: 'marketing.discover.challenges-desc',
    href: '/challenges',
    color: 'from-yellow-100 to-yellow-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.rewards',
    desc: 'marketing.discover.rewards-desc',
    href: '/rewards',
    color: 'from-amber-100 to-yellow-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.gift-guide',
    desc: 'marketing.discover.gift-guide-desc',
    href: '/gift-guide',
    color: 'from-red-100 to-pink-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.price-estimator',
    desc: 'marketing.discover.price-estimator-desc',
    href: '/price-estimator',
    color: 'from-emerald-100 to-emerald-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.onboarding',
    desc: 'marketing.discover.onboarding-desc',
    href: '/onboarding',
    color: 'from-purple-100 to-indigo-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.search',
    desc: 'marketing.discover.search-desc',
    href: '/search',
    color: 'from-gray-100 to-gray-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.marketplace',
    desc: 'marketing.discover.marketplace-desc',
    href: '/marketplace',
    color: 'from-lime-100 to-lime-200',
  },
  {
    emoji: '',
    title: 'marketing.discover.subscription-boxes',
    desc: 'marketing.discover.subscription-boxes-desc',
    href: '/subscription-boxes',
    color: 'from-sky-100 to-sky-200',
  },
] as const;

export default function DiscoverPage(): JSX.Element {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.discover.header-title')}
        </h1>
        <p className="mt-2 text-text-secondary">{t('marketing.discover.header-subtitle')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FEATURES.map((f, i) => (
          <Link key={i} href={f.href}>
            <Card
              hover
              padding="md"
              className={`h-full bg-gradient-to-br ${f.color} dark:bg-none dark:bg-gray-900`}
            >
              <span className="text-3xl">{f.emoji}</span>
              <h3 className="mt-3 font-bold text-sm text-text-primary dark:text-gray-100">
                {t(f.title)}
              </h3>
              <p className="mt-1 text-xs text-text-secondary dark:text-gray-400">{t(f.desc)}</p>
            </Card>
          </Link>
        ))}
      </div>

      <TrendingNow />
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
            <Link key={s.serviceId as number} href="/services">
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
