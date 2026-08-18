import Link from 'next/link';
import { Card, Button } from '@galaxy/ui';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

const PACKAGES = [
  {
    emoji: '',
    title: 'marketing.mommy-and-me.pkg-mani-title',
    desc: 'marketing.mommy-and-me.pkg-mani-desc',
    price: 150,
    services: ['marketing.mommy-and-me.svc-manicure', 'marketing.mommy-and-me.svc-nail-polish'],
  },
  {
    emoji: '‍️',
    title: 'marketing.mommy-and-me.pkg-hair-title',
    desc: 'marketing.mommy-and-me.pkg-hair-desc',
    price: 200,
    services: ['marketing.mommy-and-me.svc-hairstyle'],
  },
  {
    emoji: '',
    title: 'marketing.mommy-and-me.pkg-skin-title',
    desc: 'marketing.mommy-and-me.pkg-skin-desc',
    price: 250,
    services: ['marketing.mommy-and-me.svc-facial', 'marketing.mommy-and-me.svc-mask'],
  },
  {
    emoji: '',
    title: 'marketing.mommy-and-me.pkg-wedding-title',
    desc: 'marketing.mommy-and-me.pkg-wedding-desc',
    price: 500,
    services: [
      'marketing.mommy-and-me.svc-makeup',
      'marketing.mommy-and-me.svc-hairstyle',
      'marketing.mommy-and-me.svc-manicure',
    ],
  },
  {
    emoji: '',
    title: 'marketing.mommy-and-me.pkg-birthday-title',
    desc: 'marketing.mommy-and-me.pkg-birthday-desc',
    price: 300,
    services: [
      'marketing.mommy-and-me.svc-makeup',
      'marketing.mommy-and-me.svc-hairstyle',
      'marketing.mommy-and-me.svc-manicure',
    ],
  },
  {
    emoji: '‍️',
    title: 'marketing.mommy-and-me.pkg-spa-title',
    desc: 'marketing.mommy-and-me.pkg-spa-desc',
    price: 600,
    services: [
      'marketing.mommy-and-me.svc-massage',
      'marketing.mommy-and-me.svc-moroccan-bath',
      'marketing.mommy-and-me.svc-skincare',
      'marketing.mommy-and-me.svc-manicure',
      'marketing.mommy-and-me.svc-pedicure',
    ],
  },
] as const;

export default async function MommyAndMePage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-7xl">‍</span>
        <h1 className="mt-6 text-4xl font-extrabold text-text-primary dark:text-gray-100">
          Mommy & Me
        </h1>
        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
          {t('marketing.mommy-and-me.subtitle', locale)}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PACKAGES.map((pkg, i) => (
          <Card key={i} padding="lg" hover>
            <div className="text-center">
              <span className="text-5xl">{pkg.emoji}</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary dark:text-gray-100">
                {t(pkg.title, locale)}
              </h3>
              <p className="mt-2 text-sm text-text-secondary">{t(pkg.desc, locale)}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                {pkg.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-600 dark:bg-pink-950"
                  >
                    {t(s, locale)}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-2xl font-extrabold text-brand-600">
                {t('marketing.mommy-and-me.price-sar', locale, { price: pkg.price })}
              </p>
              <p className="text-xs text-text-tertiary">
                {t('marketing.mommy-and-me.per-two', locale)}
              </p>
              <Link href="/bookings/create" className="mt-4 inline-block">
                <Button size="sm">{t('marketing.mommy-and-me.book-for-two', locale)}</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-12 dark:from-pink-950 dark:to-purple-950">
        <h2 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.mommy-and-me.gift-ideal', locale)}
        </h2>
        <p className="mt-3 text-text-secondary max-w-md mx-auto">
          {t('marketing.mommy-and-me.gift-desc', locale)}
        </p>
        <Link href="/gift-cards" className="mt-6 inline-block">
          <Button size="lg">{t('marketing.mommy-and-me.buy-gift-card', locale)}</Button>
        </Link>
      </div>
    </div>
  );
}
