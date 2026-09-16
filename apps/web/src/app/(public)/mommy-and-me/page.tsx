import type { JSX } from 'react';
import Link from 'next/link';
import { Button } from '@galaxy/ui';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';
import { MommyAndMeBundles } from './MommyAndMeBundles';

export default async function MommyAndMePage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-7xl">🤱</span>
        <h1 className="mt-6 text-4xl font-extrabold text-text-primary">Mommy & Me</h1>
        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
          {t('marketing.mommy-and-me.subtitle', locale)}
        </p>
      </div>

      {/* K3 — data-driven bookable bundles (ServiceBundle rows) */}
      <MommyAndMeBundles />

      <div className="mt-16 text-center bg-linear-to-r from-pink-50 to-brand-50 rounded-3xl p-12 dark:from-pink-950 dark:to-brand-950">
        <h2 className="text-2xl font-bold text-text-primary">
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
