'use client';

import Link from 'next/link';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { Button, Card, ErrorAlert, EmptyState, ServiceImage } from '@galaxy/ui';

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

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-24 text-center text-white">
        <h1 className="text-3xl font-extrabold md:text-5xl">{t('marketing.home.hero-title')}</h1>
        <p className="mt-4 text-lg text-brand-100">{t('marketing.home.hero-subtitle')}</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/bookings/create">
            <Button size="lg" className="bg-white !text-brand-700 hover:bg-surface-muted">
              {t('marketing.home.book-now')}
            </Button>
          </Link>
          <Link href="/services/surprise-me">
            <Button
              size="lg"
              variant="outline"
              className="border-white !text-white hover:bg-white/10"
            >
              {t('marketing.home.surprise-me')}
            </Button>
          </Link>
        </div>
      </section>

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
      <section className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950 px-4 py-16">
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
                <p className="mt-3 text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900 dark:to-purple-900">
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
