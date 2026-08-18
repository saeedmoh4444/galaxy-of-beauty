import Link from 'next/link';
import { Card, Button, formatCurrency } from '@galaxy/ui';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

const LOOKS = [
  {
    id: 'bridal',
    emoji: '',
    name: 'marketing.shop-the-look.look-bridal-name',
    desc: 'marketing.shop-the-look.look-bridal-desc',
    color: 'from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950',
    services: [
      {
        name: 'marketing.shop-the-look.service-bridal-makeup',
        price: 500,
        duration: 90,
        emoji: '',
      },
      { name: 'marketing.shop-the-look.service-hair-style', price: 300, duration: 60, emoji: '‍️' },
      {
        name: 'marketing.shop-the-look.service-manicure-pedicure',
        price: 150,
        duration: 60,
        emoji: '',
      },
      { name: 'marketing.shop-the-look.service-skincare', price: 200, duration: 45, emoji: '' },
    ],
  },
  {
    id: 'party',
    emoji: '',
    name: 'marketing.shop-the-look.look-party-name',
    desc: 'marketing.shop-the-look.look-party-desc',
    color: 'from-purple-100 to-violet-100 dark:from-purple-950 dark:to-violet-950',
    services: [
      {
        name: 'marketing.shop-the-look.service-evening-makeup',
        price: 300,
        duration: 60,
        emoji: '',
      },
      { name: 'marketing.shop-the-look.service-hair-style', price: 200, duration: 45, emoji: '‍️' },
      { name: 'marketing.shop-the-look.service-lashes', price: 80, duration: 30, emoji: '️' },
    ],
  },
  {
    id: 'spa',
    emoji: '‍️',
    name: 'marketing.shop-the-look.look-spa-name',
    desc: 'marketing.shop-the-look.look-spa-desc',
    color: 'from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950',
    services: [
      {
        name: 'marketing.shop-the-look.service-full-massage',
        price: 300,
        duration: 60,
        emoji: '‍️',
      },
      {
        name: 'marketing.shop-the-look.service-moroccan-bath',
        price: 250,
        duration: 45,
        emoji: '‍️',
      },
      { name: 'marketing.shop-the-look.service-skincare', price: 200, duration: 45, emoji: '' },
      { name: 'marketing.shop-the-look.service-manicure', price: 80, duration: 30, emoji: '' },
    ],
  },
  {
    id: 'casual',
    emoji: '️',
    name: 'marketing.shop-the-look.look-casual-name',
    desc: 'marketing.shop-the-look.look-casual-desc',
    color: 'from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950',
    services: [
      {
        name: 'marketing.shop-the-look.service-natural-makeup',
        price: 150,
        duration: 30,
        emoji: '',
      },
      {
        name: 'marketing.shop-the-look.service-hair-styling',
        price: 100,
        duration: 30,
        emoji: '‍️',
      },
    ],
  },
  {
    id: 'interview',
    emoji: '',
    name: 'marketing.shop-the-look.look-interview-name',
    desc: 'marketing.shop-the-look.look-interview-desc',
    color: 'from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950',
    services: [
      {
        name: 'marketing.shop-the-look.service-professional-makeup',
        price: 200,
        duration: 45,
        emoji: '',
      },
      { name: 'marketing.shop-the-look.service-work-hair', price: 120, duration: 30, emoji: '‍️' },
      { name: 'marketing.shop-the-look.service-brows', price: 60, duration: 20, emoji: '' },
    ],
  },
  {
    id: 'photoshoot',
    emoji: '',
    name: 'marketing.shop-the-look.look-photoshoot-name',
    desc: 'marketing.shop-the-look.look-photoshoot-desc',
    color: 'from-fuchsia-100 to-pink-100 dark:from-fuchsia-950 dark:to-pink-950',
    services: [
      { name: 'marketing.shop-the-look.service-photo-makeup', price: 400, duration: 90, emoji: '' },
      { name: 'marketing.shop-the-look.service-hair-style', price: 250, duration: 45, emoji: '‍️' },
      { name: 'marketing.shop-the-look.service-manicure', price: 100, duration: 30, emoji: '' },
    ],
  },
] as const;

export default async function ShopTheLookPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <span className="text-6xl">️</span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.shop-the-look.title', locale)}
        </h1>
        <p className="mt-2 text-text-secondary">{t('marketing.shop-the-look.subtitle', locale)}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {LOOKS.map((look) => {
          const total = look.services.reduce((sum, s) => sum + s.price, 0);
          const totalDuration = look.services.reduce((sum, s) => sum + s.duration, 0);
          return (
            <Card key={look.id} padding="lg" className={`bg-gradient-to-br ${look.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{look.emoji}</span>
                <div>
                  <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
                    {t(look.name, locale)}
                  </h2>
                  <p className="text-sm text-text-secondary dark:text-gray-400">
                    {t(look.desc, locale)}
                  </p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {look.services.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-white/60 dark:bg-gray-800/60 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span>{s.emoji}</span>
                      <span className="text-sm font-medium text-text-primary dark:text-gray-100">
                        {t(s.name, locale)}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {t('marketing.shop-the-look.duration-min', locale, { count: s.duration })}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-brand-600">
                      {formatCurrency(s.price)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-edge/50 dark:border-gray-700/50 pt-4">
                <div>
                  <p className="text-lg font-extrabold text-text-primary dark:text-gray-100">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('marketing.shop-the-look.total-info', locale, {
                      duration: totalDuration,
                      count: look.services.length,
                    })}
                  </p>
                </div>
                <Link href="/bookings/create">
                  <Button>{t('marketing.shop-the-look.book-look', locale)}</Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
