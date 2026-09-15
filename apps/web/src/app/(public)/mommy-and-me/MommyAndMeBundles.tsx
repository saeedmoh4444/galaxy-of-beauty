'use client';

import type { JSX } from 'react';
import Link from 'next/link';
import { Card, Button, GridSkeleton } from '@galaxy/ui';
import { api } from '@/lib/trpc';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

// K3 (kids plan) — the Mommy & Me packages are now real bookable bundles
// (ServiceBundle rows), not static marketing copy. Book goes to the
// booking flow with the bundle preselected.

const BUNDLE_EMOJI = ['💅', '💇', '🧖', '👰'];

export function MommyAndMeBundles(): JSX.Element {
  const { t, locale } = useLocale();
  const bundlesQ = api.bundles.list.useQuery();

  if (bundlesQ.isLoading) {
    return <GridSkeleton count={4} />;
  }

  const bundles = (bundlesQ.data as unknown as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {bundles.map((b, i) => {
        const primary = b.primaryService as Record<string, unknown>;
        const child = b.childService as Record<string, unknown>;
        return (
          <Card key={b.id as number} padding="lg" hover>
            <div className="text-center">
              <span className="text-5xl">{BUNDLE_EMOJI[i] ?? '🎀'}</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary dark:text-gray-100">
                {localize(b.nameJson, locale)}
              </h3>
              <p className="mt-2 text-sm text-text-secondary">
                {localize(b.descriptionJson, locale)}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                <span className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-600 dark:bg-pink-950">
                  {localize(primary?.titleJson, locale)}
                </span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-950">
                  👶 {localize(child?.titleJson, locale)}
                </span>
              </div>
              <p className="mt-4 text-2xl font-extrabold text-brand-600">
                {Number(b.bundlePrice).toFixed(0)} {t('misc.sar')}
              </p>
              <p className="text-xs text-text-tertiary">{t('marketing.mommy-and-me.per-two')}</p>
              <Link href={`/bookings/create?bundleId=${b.id}`} className="mt-4 inline-block">
                <Button size="sm">{t('marketing.mommy-and-me.book-for-two')}</Button>
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
