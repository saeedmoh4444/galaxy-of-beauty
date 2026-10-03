'use client';
import { useEffect } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export interface ShippingFields {
  personName: string;
  mobile: string;
  lineAddress: string;
  cityName: string;
  postalCode: string;
  countryCode: string;
  shippingMethod: 1 | 2;
}

interface ShippingFormProps {
  value: ShippingFields;
  onChange: (next: Partial<ShippingFields>) => void;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  onChargeChange: (charge: number | null) => void;
}

const inputCls =
  'w-full rounded-lg border border-edge bg-surface px-3 py-2 text-sm focus:border-brand-400 focus:outline-none';
const labelCls = 'block text-sm font-medium mb-1 text-text-secondary';

/**
 * MyFatoorah shipping block: country + debounced city lookup, consignee
 * fields, courier choice, and the live shipping charge.
 */
export default function ShippingForm({
  value,
  onChange,
  items,
  onChargeChange,
}: ShippingFormProps): JSX.Element {
  const { t, locale } = useLocale();

  const countriesQ = api.payments.shippingCountries.useQuery();
  const citiesQ = api.payments.shippingCities.useQuery(
    {
      countryCode: value.countryCode,
      shippingMethod: value.shippingMethod,
    },
    { enabled: value.countryCode.length > 0 },
  );
  const chargeQ = api.payments.shippingCharge.useQuery(
    {
      shippingMethod: value.shippingMethod,
      countryCode: value.countryCode,
      cityName: value.cityName,
      postalCode: value.postalCode,
      items,
    },
    {
      enabled: items.length > 0 && value.cityName.length > 0 && value.postalCode.length > 0,
    },
  );

  // Debounced city search is intentionally not wired yet — the couriers
  // accept a full city list, so the select shows every city for the
  // selected country.

  useEffect(() => {
    onChargeChange(chargeQ.data ? chargeQ.data.shippingCharge : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeQ.data?.shippingCharge]);

  const countryLabel = (c: { countryCode: string; englishName: string; arabicName: string }) =>
    locale === 'ar' ? c.arabicName || c.englishName : c.englishName || c.arabicName;

  return (
    <Card padding="lg">
      <h3 className="font-bold mb-3">{t('wallet.shipping-title')}</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('wallet.shipping-country')}</label>
            <select
              className={inputCls}
              value={value.countryCode}
              onChange={(e) => onChange({ countryCode: e.target.value, cityName: '' })}
            >
              <option value="">—</option>
              {(countriesQ.data ?? []).map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {countryLabel(c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('wallet.shipping-city')}</label>
            <select
              className={inputCls}
              value={value.cityName}
              disabled={!value.countryCode || citiesQ.isLoading}
              onChange={(e) => onChange({ cityName: e.target.value })}
            >
              <option value="">
                {citiesQ.isLoading
                  ? '…'
                  : (citiesQ.data ?? []).length === 0
                    ? t('wallet.shipping-city-placeholder')
                    : '—'}
              </option>
              {(citiesQ.data ?? []).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('wallet.shipping-person-name')}</label>
            <input
              className={inputCls}
              value={value.personName}
              onChange={(e) => onChange({ personName: e.target.value })}
              placeholder="Saeed"
            />
          </div>
          <div>
            <label className={labelCls}>{t('wallet.shipping-mobile')}</label>
            <input
              className={inputCls}
              dir="ltr"
              value={value.mobile}
              onChange={(e) => onChange({ mobile: e.target.value })}
              placeholder="05xxxxxxxx"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>{t('wallet.shipping-line-address')}</label>
          <input
            className={inputCls}
            value={value.lineAddress}
            onChange={(e) => onChange({ lineAddress: e.target.value })}
            placeholder="Street, building, floor"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('wallet.shipping-postal-code')}</label>
            <input
              className={inputCls}
              dir="ltr"
              value={value.postalCode}
              onChange={(e) => onChange({ postalCode: e.target.value })}
              placeholder="12345"
            />
          </div>
          <div>
            <label className={labelCls}>{t('wallet.shipping-method')}</label>
            <div className="flex gap-2">
              {(
                [
                  [1, t('wallet.shipping-method-dhl')],
                  [2, t('wallet.shipping-method-aramex')],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange({ shippingMethod: m })}
                  className={`flex-1 rounded-lg border-2 px-2 py-2 text-sm ${
                    value.shippingMethod === m ? 'border-brand-400 bg-brand-50' : 'border-edge'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {chargeQ.isLoading && (
          <p className="text-xs text-text-secondary">{t('wallet.redirecting-gateway')}</p>
        )}
        {chargeQ.isError && (
          <p className="text-xs text-red-600 dark:text-red-400">{chargeQ.error.message}</p>
        )}
      </div>
    </Card>
  );
}
