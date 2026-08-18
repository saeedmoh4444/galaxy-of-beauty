'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { GridSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
const BUNDLE_DISCOUNTS: Record<number, number> = { 2: 10, 3: 15, 4: 20, 5: 25 };

interface BundlesServiceItem {
  id: number;
  titleJson: { ar?: string; en?: string };
  durationMin: number;
  basePrice: number;
  _isCat?: boolean;
}

type BundlesCategoryItem = Omit<RouterOutputs['categories']['list'][number], 'children'> & {
  services?: BundlesServiceItem[];
  children: BundlesCategoryItem[];
  _isCat?: boolean;
};

type BundlesCard = BundlesServiceItem | (BundlesCategoryItem & { _isCat: true });

export default function BundlesPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading } = api.categories.list.useQuery();
  const services = (data ?? []) as BundlesCategoryItem[];
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 5) {
        next.add(id);
      }
      return next;
    });
  };

  const count = selected.size;
  const discount = BUNDLE_DISCOUNTS[count] || 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.bundles.title')}
        </h1>
        <p className="mt-2 text-text-secondary">{t('marketing.bundles.subtitle')}</p>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {[2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${count >= n ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-text-tertiary'}`}
          >
            {t('marketing.bundles.discount-formula', {
              n,
              percent: BUNDLE_DISCOUNTS[n],
            })}
          </div>
        ))}
      </div>

      {count > 0 && (
        <div className="mb-6 text-center">
          <p className="text-lg">
            <span className="text-text-secondary">
              {t('marketing.bundles.services-count-label')}
            </span>
            <span className="font-bold">{count}</span> ·{' '}
            <span className="text-text-secondary">{t('marketing.bundles.discount-label')}</span>
            <span className="font-bold text-green-600">-{discount}%</span>
          </p>
        </div>
      )}

      {isLoading ? (
        <GridSkeleton count={8} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services
            .flatMap((cat) => {
              const children = cat.children || [];
              return [
                ...(cat.services ? [{ ...cat, _isCat: true }] : []),
                ...children.flatMap((child) => child.services || []),
              ] as BundlesCard[];
            })
            .slice(0, 30)
            .map((svc) =>
              svc._isCat ? null : (
                <button
                  key={svc.id}
                  onClick={() => toggle(svc.id)}
                  className={`text-right rounded-2xl border-2 p-4 transition-all ${selected.has(svc.id) ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-edge hover:border-brand-300 dark:border-gray-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary dark:text-gray-100">
                        {localize(svc.titleJson, locale)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {t('marketing.bundles.duration-min', { min: svc.durationMin })}
                      </p>
                      <p className="mt-1 font-bold text-brand-600">
                        {formatCurrency(Number(svc.basePrice))}
                      </p>
                    </div>
                    <div
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${selected.has(svc.id) ? 'border-brand-600 bg-brand-600' : 'border-edge'}`}
                    >
                      {selected.has(svc.id) && <span className="text-white text-xs"></span>}
                    </div>
                  </div>
                </button>
              ),
            )}
        </div>
      )}

      {count >= 2 && (
        <div className="mt-8 text-center">
          <Link href={`/bookings/create?serviceIds=${[...selected].join(',')}`}>
            <Button size="lg">{t('marketing.bundles.book-cta', { discount })}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
