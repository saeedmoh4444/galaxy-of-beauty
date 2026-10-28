'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { Button, Input, Card, formatCurrency } from '@galaxy/ui';
import { api } from '@/lib/trpc';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const DAY_KEYS: Record<number, string> = {
  5: 'vendorPortal.pricing.fri',
  6: 'vendorPortal.pricing.sat',
};

/** C3 — vendor pricing rules panel: uplift-only rules list + add form +
 *  the per-product price change log (admin overrides shown inline). */
export function PricingRulesPanel(): JSX.Element {
  const { t, locale } = useLocale();
  const rulesQ = api.vendorPortal.priceRules.useQuery();
  const prodsQ = api.vendorPortal.myProducts.useQuery({});
  const rules = rulesQ.data ?? [];
  const products = prodsQ.data?.items ?? [];

  const [showForm, setShowForm] = useState(false);
  const [ruleType, setRuleType] = useState<'weekend_uplift' | 'lowstock_floor'>('weekend_uplift');
  const [dayOfWeek, setDayOfWeek] = useState(5);
  const [multiplier, setMultiplier] = useState(1.1);
  const [productId, setProductId] = useState<number | undefined>();
  const [logProductId, setLogProductId] = useState<number | null>(null);

  const addMut = api.vendorPortal.addPriceRule.useMutation({
    onSuccess: () => {
      setShowForm(false);
      setMultiplier(1.1);
      setProductId(undefined);
      void rulesQ.refetch();
    },
  });
  const deactivateMut = api.vendorPortal.updatePriceRule.useMutation({
    onSuccess: () => void rulesQ.refetch(),
  });
  const logQ = api.vendorPortal.priceLog.useQuery(
    { productId: logProductId ?? 0 },
    { enabled: logProductId !== null },
  );

  const typeLabel = (r: (typeof rules)[number]) =>
    r.ruleType === 'weekend_uplift'
      ? t('vendorPortal.pricing.weekend')
      : t('vendorPortal.pricing.lowstock');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t('vendorPortal.pricing.title')}</h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
          + {t('vendorPortal.pricing.add')}
        </Button>
      </div>

      {showForm ? (
        <Card padding="md" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('vendorPortal.pricing.type')}
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value as 'weekend_uplift' | 'lowstock_floor')}
            />
            {ruleType === 'weekend_uplift' ? (
              <Input
                label={t('vendorPortal.pricing.day')}
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10) || 5)}
              />
            ) : null}
            <Input
              label={t('vendorPortal.pricing.multiplier')}
              type="number"
              step="0.05"
              min="1"
              max="5"
              value={multiplier}
              onChange={(e) => setMultiplier(parseFloat(e.target.value) || 1)}
            />
            <Input
              label={t('vendorPortal.pricing.product')}
              value={productId ?? ''}
              onChange={(e) => setProductId(Number(e.target.value) || undefined)}
            />
          </div>
          {addMut.isError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{addMut.error.message}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              {t('button.cancel')}
            </Button>
            <Button
              size="sm"
              disabled={multiplier < 1}
              loading={addMut.isPending}
              onClick={() =>
                addMut.mutate({
                  ruleType,
                  dayOfWeek: ruleType === 'weekend_uplift' ? dayOfWeek : undefined,
                  multiplier,
                  productId,
                })
              }
            >
              {t('vendorPortal.pricing.add')}
            </Button>
          </div>
        </Card>
      ) : null}

      {rules.length === 0 && !rulesQ.isLoading ? (
        <p className="text-sm text-text-tertiary">{t('vendorPortal.pricing.empty')}</p>
      ) : null}

      {rules.map((r) => {
        const productName = r.product
          ? ((r.product.nameJson as { ar?: string; en?: string } | null)?.[
              locale === 'ar' ? 'ar' : 'en'
            ] ?? `#${r.product.id}`)
          : null;
        const m = r.adminOverrideMultiplier !== null ? r.adminOverrideMultiplier : r.multiplier;
        return (
          <Card key={r.id} padding="sm" className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold">
                {typeLabel(r)}
                {r.ruleType === 'weekend_uplift' && r.dayOfWeek !== null
                  ? ` · ${t((DAY_KEYS[r.dayOfWeek] ?? 'vendorPortal.pricing.allDays') as TranslationKey)}`
                  : ''}
                {productName ? ` · ${productName}` : ''}
              </p>
              <p className="text-xs text-text-secondary">
                ×{Number(m).toFixed(2)}
                {r.adminOverrideMultiplier !== null
                  ? ` · ${t('vendorPortal.pricing.override')}`
                  : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {r.isActive ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                  {t('vendorPortal.pricing.active')}
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {t('vendorPortal.pricing.deactivate')}
                </span>
              )}
              {r.isActive ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deactivateMut.mutate({ ruleId: r.id, isActive: false })}
                >
                  {t('vendorPortal.pricing.deactivate')}
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                disabled={r.productId === null && products.length === 0}
                onClick={() =>
                  setLogProductId(r.productId ?? (products[0] ? Number(products[0].id) : null))
                }
              >
                {t('vendorPortal.pricing.log')}
              </Button>
            </div>
          </Card>
        );
      })}

      {/* C3 — per-product price change log. */}
      <Card padding="md">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t('vendorPortal.pricing.log')}</h3>
          <Input
            label=""
            value={logProductId ?? ''}
            onChange={(e) => setLogProductId(Number(e.target.value) || null)}
            placeholder={t('vendorPortal.pricing.product')}
            className="w-40"
          />
        </div>
        {logProductId === null ? (
          <p className="text-xs text-text-tertiary">{t('vendorPortal.pricing.logEmpty')}</p>
        ) : (logQ.data ?? []).length === 0 ? (
          <p className="text-xs text-text-tertiary">{t('vendorPortal.pricing.logEmpty')}</p>
        ) : (
          <ul className="space-y-1">
            {(logQ.data ?? []).map((row) => (
              <li key={row.id} className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  {formatCurrency(Number(row.oldPrice))} → {formatCurrency(Number(row.newPrice))}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-text-tertiary">
                    {new Date(row.createdAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      row.changedBy === 'admin'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {row.changedBy === 'admin'
                      ? t('vendorPortal.pricing.byAdmin')
                      : t('vendorPortal.pricing.byVendor')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
