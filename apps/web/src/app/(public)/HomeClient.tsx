'use client';

import Link from 'next/link';
import { localize, getHomeGreetingKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { api } from '@/lib/trpc';
import {
  Button,
  Card,
  ErrorAlert,
  EmptyState,
  ServiceImage,
  FloatingBlob,
  Marquee,
  Sparkles,
} from '@galaxy/ui';
import { heroImages } from '@galaxy/shared';

interface Category {
  id: number;
  nameJson: { ar?: string; en?: string };
  slug: string;
}

interface Service {
  id: number;
  titleJson: { ar?: string; en?: string };
  basePrice: number;
  durationMin: number;
}

export interface HomePageProps {
  initialCategories: Category[];
  initialServices: Service[];
  serviceTotal: number;
  fetchError?: string;
}

type HomeGreeting = {
  stage: string;
  pamper: {
    isActive: boolean;
    deals: Array<Record<string, unknown>>;
    kits: Array<Record<string, unknown>>;
    spaServices: Array<Record<string, unknown>>;
  };
};

function categoryImageKey(slug: string): string {
  const map: Record<string, string> = {
    hair: 'hair',
    nails: 'nails',
    skincare: 'skincare',
    makeup: 'makeup',
    massage: 'massage',
    henna: 'henna',
    waxing: 'waxing',
    lashes: 'lashes',
    body: 'bodyTreatments',
    spa: 'spa',
    bridal: 'bridal',
    men: 'mensGrooming',
  };
  return map[slug] ?? 'default';
}

export function HomeClient({
  initialCategories,
  initialServices,
  serviceTotal,
  fetchError,
}: HomePageProps): JSX.Element {
  const { t, locale } = useLocale();
  const categories = initialCategories;
  const svcItems = initialServices;

  // Stage-aware greeting (E6a) — guest-safe: back_to_me until the
  // per-user stage arrives from the API.
  const greetingQ = api.lifeStage.homeGreeting.useQuery();
  const greeting = greetingQ.data as HomeGreeting | undefined;
  const stage = greeting?.stage ?? 'back_to_me';
  const pamper = greeting?.pamper;

  return (
    <div>
      {/* Hero — K-beauty flat design */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-brand-50 via-surface to-accent-50"
        />
        <FloatingBlob
          gradient="from-brand-200 to-accent-100"
          className="-top-24 -start-24 h-72 w-72"
          opacity={70}
        />
        <FloatingBlob
          gradient="from-accent-200 to-brand-100"
          className="top-1/3 -end-20 h-80 w-80"
          animation="float-slow"
          delay={-4}
          opacity={60}
        />
        <FloatingBlob
          gradient="from-brand-300 to-brand-100"
          className="bottom-0 start-1/4 h-56 w-56"
          animation="float"
          delay={-2}
          opacity={40}
        />
        <Sparkles
          sparkles={[
            { top: '12%', start: '8%', size: 18, delay: -0.5, color: '#e268a0' },
            { top: '24%', start: '90%', size: 14, delay: -2.1, color: '#d98e4a' },
            { top: '70%', start: '5%', size: 12, delay: -1.2, color: '#e268a0' },
            { top: '78%', start: '94%', size: 20, delay: -3, color: '#d98e4a' },
          ]}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-100/80 px-4 py-1.5 text-sm font-bold text-brand-700 ring-1 ring-brand-200">
                <span aria-hidden>✨</span> {t('women.safeSpace')}
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-text-primary md:text-5xl lg:text-6xl">
                {t('marketing.home.hero-title')}
              </h1>
              <p
                data-testid="hero-greeting"
                className="mt-5 max-w-xl text-lg text-text-secondary md:text-xl"
              >
                {t(getHomeGreetingKey(stage))}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/bookings/create">
                  <Button size="lg" className="rounded-full px-8 shadow-lg shadow-brand-600/25">
                    {t('marketing.home.book-now')}
                  </Button>
                </Link>
                <Link href="/services/surprise-me">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-brand-300 px-8 !text-brand-700 hover:bg-brand-50"
                  >
                    {t('marketing.home.surprise-me')}
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-text-secondary">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>🌸</span> {t('trust.womenOnly')}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>🔒</span> {t('vendorPortal.trust.private-suite')}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="text-accent-500">
                    ★
                  </span>{' '}
                  4.8 {t('misc.rating')}
                </span>
              </div>
            </div>

            {/* media composition — blob-framed photo + floating cards */}
            <div className="relative mx-auto w-full max-w-md">
              <div
                aria-hidden
                className="absolute inset-0 rotate-6 rounded-[3rem] bg-gradient-to-br from-brand-200 to-accent-200"
              />
              <ServiceImage
                src={heroImages.main}
                alt={t('marketing.home.hero-title')}
                className="relative h-72 w-full rounded-[3rem] object-cover shadow-2xl shadow-brand-600/20 md:h-96"
              />
              <div className="absolute -start-6 top-8 animate-float rounded-2xl bg-surface-elevated p-3 shadow-lg shadow-brand-600/10">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="text-accent-500">
                    ★
                  </span>
                  <span className="text-sm font-extrabold text-text-primary">4.8</span>
                  <span className="text-xs text-text-tertiary">{t('misc.rating')}</span>
                </div>
              </div>
              <div className="absolute -end-4 bottom-10 animate-float-slow rounded-2xl bg-surface-elevated p-3 shadow-lg shadow-brand-600/10">
                <div className="flex items-center gap-2">
                  <span aria-hidden>🌸</span>
                  <span className="text-xs font-bold text-text-secondary">
                    {t('trust.womenOnly')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Marquee className="mt-16" items={categories.map((c) => localize(c.nameJson, locale))} />
        </div>
      </section>

      {/* Pamper window banner (E6a) — period-relief offers, customers only */}
      {pamper?.isActive && (
        <section
          aria-label={t('lifeStage.pamper.title')}
          data-testid="pamper-banner"
          className="mx-auto max-w-7xl px-4"
        >
          <Card
            padding="lg"
            className="border-2 border-pink-200 bg-pink-50/60 dark:border-pink-900 dark:bg-pink-950/30"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-bold">{t('lifeStage.pamper.title')}</h2>
                <p className="mt-1 text-sm font-semibold text-pink-700 dark:text-pink-300">
                  {t('lifeStage.pamper.active')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {pamper.deals.length > 0 && (
                  <Link href="/flash-deals">
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700 dark:bg-pink-900 dark:text-pink-200">
                      {t('lifeStage.pamper.deals')}
                    </span>
                  </Link>
                )}
                {pamper.kits.length > 0 && (
                  <Link href="/stores">
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700 dark:bg-pink-900 dark:text-pink-200">
                      {t('lifeStage.pamper.kits')}
                    </span>
                  </Link>
                )}
                {pamper.spaServices.length > 0 && (
                  <Link href="/search">
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700 dark:bg-pink-900 dark:text-pink-200">
                      {t('lifeStage.pamper.spa')}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold">{t('marketing.home.categories')}</h2>
        {fetchError && <ErrorAlert message={fetchError} onRetry={() => window.location.reload()} />}
        {!fetchError && categories.length === 0 && (
          <EmptyState title={t('marketing.home.no-categories')} />
        )}
        {categories.length > 0 && (
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            {categories.map((c) => (
              <Link key={c.id} href={`/services?categoryId=${c.id}`}>
                <Card hover padding="lg" className="flex flex-col items-center text-center">
                  <ServiceImage
                    service={categoryImageKey(c.slug)}
                    size="lg"
                    alt={localize(c.nameJson, locale)}
                  />
                  <h3 className="mt-3 text-sm font-semibold">{localize(c.nameJson, locale)}</h3>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular Services */}
      <section className="bg-surface-muted px-4 py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-2xl font-bold">{t('marketing.home.popular-services')}</h2>
          {fetchError && (
            <ErrorAlert message={fetchError} onRetry={() => window.location.reload()} />
          )}
          {!fetchError && svcItems.length === 0 && (
            <EmptyState title={t('marketing.home.no-services')} />
          )}
          {svcItems.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3">
              {svcItems.map((svc) => (
                <Link key={svc.id} href={`/services/${svc.id}`}>
                  <Card hover>
                    <ServiceImage
                      service={String(svc.id)}
                      size="full"
                      alt={localize(svc.titleJson, locale)}
                      className="h-40"
                    />
                    <h3 className="mt-3 font-semibold">{localize(svc.titleJson, locale)}</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {t('marketing.home.duration-min', { min: svc.durationMin })}
                    </p>
                    <p className="mt-2 font-bold text-brand-600">
                      {t('marketing.home.price-sar', { price: svc.basePrice })}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="grid gap-8 md:grid-cols-4">
          {[
            {
              label: t('marketing.home.stat-beauty-sections'),
              value: `+${categories.length || 12}`,
            },
            { label: t('marketing.home.stat-beauty-experts'), value: '+500' },
            { label: t('marketing.home.stat-services'), value: `+${serviceTotal || 25}` },
            { label: t('marketing.home.stat-saudi-cities'), value: '+24' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-brand-600">{s.value}</p>
              <p className="text-text-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-brand-50 to-brand-50 dark:from-brand-950 dark:to-brand-950 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold">
            {t('marketing.home.testimonials-title')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: t('marketing.home.testimonial-sara-name'),
                text: t('marketing.home.testimonial-sara-text'),
                rating: 5,
              },
              {
                name: t('marketing.home.testimonial-maryam-name'),
                text: t('marketing.home.testimonial-maryam-text'),
                rating: 5,
              },
              {
                name: t('marketing.home.testimonial-noura-name'),
                text: t('marketing.home.testimonial-noura-text'),
                rating: 5,
              },
            ].map((tst, i) => (
              <Card
                key={i}
                padding="lg"
                className="text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur"
              >
                <p className="text-lg font-bold text-yellow-500">
                  {'★'.repeat(tst.rating)}
                  {'☆'.repeat(5 - tst.rating)}
                </p>
                <p className="mt-3 text-sm text-text-secondary dark:text-text-tertiary leading-relaxed">
                  &ldquo;{tst.text}&rdquo;
                </p>
                <p className="mt-3 font-bold text-brand-600">— {tst.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Discover Features */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">{t('marketing.home.discover-more')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: '/virtual-try-on',
              title: t('marketing.home.feature-virtual-try-on'),
              desc: t('marketing.home.feature-virtual-try-on-desc'),
            },
            {
              href: '/tutorials',
              title: t('marketing.home.feature-tutorials'),
              desc: t('marketing.home.feature-tutorials-desc'),
            },
            {
              href: '/services',
              title: t('marketing.home.feature-salon-map'),
              desc: t('marketing.home.feature-salon-map-desc'),
            },
            {
              href: '/beauty-courses',
              title: t('marketing.home.feature-beauty-courses'),
              desc: t('marketing.home.feature-beauty-courses-desc'),
            },
            {
              href: '/blog',
              title: t('marketing.home.feature-blog'),
              desc: t('marketing.home.feature-blog-desc'),
            },
            {
              href: '/flash-deals',
              title: t('marketing.home.feature-flash-deals'),
              desc: t('marketing.home.feature-flash-deals-desc'),
            },
            {
              href: '/community',
              title: t('marketing.home.feature-community'),
              desc: t('marketing.home.feature-community-desc'),
            },
            {
              href: '/beauty-tips',
              title: t('marketing.home.feature-daily-tips'),
              desc: t('marketing.home.feature-daily-tips-desc'),
            },
          ].map((f) => (
            <Link key={f.href} href={f.href}>
              <Card hover padding="lg" className="flex items-start gap-3 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-100 dark:from-brand-900 dark:to-brand-900">
                  <span className="text-lg font-bold text-brand-600 dark:text-brand-300">
                    {f.title.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{f.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">{f.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
