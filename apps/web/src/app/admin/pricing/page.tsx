'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

const TIERS = ['NEW', 'EXPERIENCED', 'PREMIUM', 'CELEBRITY'];

export default function AdminPricingPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();

  const { data: rulesData, refetch: refetchRules } = api.pricingAdmin.list.useQuery(undefined, {
    enabled: isAuthenticated,
  }) as { data: Array<Record<string, unknown>> | undefined; refetch: () => void };
  const { data: servicesData, refetch: refetchServices } = api.services.list.useQuery(
    { page: 1, limit: 100 },
    { enabled: isAuthenticated },
  ) as { data: { items: Array<Record<string, unknown>> } | undefined; refetch: () => void };

  const createMut = api.pricingAdmin.create.useMutation({ onSuccess: () => refetchRules() });
  const updateMut = api.pricingAdmin.update.useMutation({ onSuccess: () => refetchRules() });
  const deleteMut = api.pricingAdmin.delete.useMutation({ onSuccess: () => refetchRules() });
  const flagMut = api.pricingAdmin.setServiceFlag.useMutation({
    onSuccess: () => refetchServices(),
  });

  const [serviceId, setServiceId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tier, setTier] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [hourStart, setHourStart] = useState('');
  const [hourEnd, setHourEnd] = useState('');
  const [multiplier, setMultiplier] = useState('1.3');

  const rules = rulesData ?? [];
  const services = servicesData?.items ?? [];

  const submit = () => {
    createMut.mutate({
      serviceId: serviceId ? Number(serviceId) : null,
      categoryId: categoryId ? Number(categoryId) : null,
      technicianTier: (tier || null) as 'NEW' | 'EXPERIENCED' | 'PREMIUM' | 'CELEBRITY' | null,
      dayOfWeek: dayOfWeek === '' ? null : Number(dayOfWeek),
      hourStart: hourStart === '' ? null : Number(hourStart),
      hourEnd: hourEnd === '' ? null : Number(hourEnd),
      priceMultiplier: Number(multiplier) || 1,
    });
  };

  const serviceName = (r: Record<string, unknown>) => {
    const svc = r.service as Record<string, unknown> | null;
    return svc ? localize(svc.titleJson, locale) : t('admin.pricing.any');
  };
  const ruleDesc = (r: Record<string, unknown>) => {
    const parts: string[] = [];
    if (r.technicianTier) parts.push(String(r.technicianTier));
    if (r.dayOfWeek !== null && r.dayOfWeek !== undefined)
      parts.push(t(`admin.pricing.day-${Number(r.dayOfWeek)}` as never));
    if (r.hourStart !== null && r.hourEnd !== null) parts.push(`${r.hourStart}:00-${r.hourEnd}:00`);
    return parts.join(' · ') || t('admin.pricing.any');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.pricing.title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('admin.pricing.subtitle')}</p>
      </div>

      {/* Create rule */}
      <Card padding="lg">
        <h3 className="mb-3 font-bold">{t('admin.pricing.create-title')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
          >
            <option value="">{t('admin.pricing.service')}</option>
            {services.map((s) => (
              <option key={s.id as number} value={s.id as number}>
                {localize(s.titleJson as never, locale)}
              </option>
            ))}
          </select>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
          >
            <option value="">
              {t('admin.pricing.tier')} — {t('admin.pricing.any')}
            </option>
            {TIERS.map((tr) => (
              <option key={tr} value={tr}>
                {tr}
              </option>
            ))}
          </select>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
          >
            <option value="">
              {t('admin.pricing.day')} — {t('admin.pricing.any')}
            </option>
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <option key={d} value={d}>
                {t(`admin.pricing.day-${d}` as never)}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={hourStart}
              onChange={(e) => setHourStart(e.target.value)}
              min={0}
              max={23}
              placeholder={t('admin.pricing.hour-start')}
              className="rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
            />
            <input
              type="number"
              value={hourEnd}
              onChange={(e) => setHourEnd(e.target.value)}
              min={0}
              max={24}
              placeholder={t('admin.pricing.hour-end')}
              className="rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
            />
          </div>
          <input
            type="number"
            step="0.05"
            value={multiplier}
            onChange={(e) => setMultiplier(e.target.value)}
            min={0.1}
            max={5}
            placeholder={t('admin.pricing.multiplier')}
            className="rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
          >
            <option value="">{t('admin.pricing.category')}</option>
          </select>
        </div>
        <Button onClick={submit} loading={createMut.isPending} className="mt-3 w-full">
          {t('admin.pricing.create-button')}
        </Button>
      </Card>

      {/* Rules table */}
      <Card padding="lg">
        <h3 className="mb-3 font-bold">{t('admin.pricing.rules-title')}</h3>
        {rules.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t('admin.pricing.no-rules')}</p>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div
                key={r.id as number}
                className="flex items-center justify-between rounded-xl bg-surface-muted p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{serviceName(r)}</p>
                  <p className="text-xs text-text-secondary">
                    {ruleDesc(r)} · ×{Number(r.priceMultiplier).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-surface-muted text-text-tertiary'
                    }`}
                  >
                    {r.isActive ? t('admin.pricing.active') : t('admin.pricing.inactive')}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateMut.mutate({ id: r.id as number, isActive: !(r.isActive as boolean) })
                    }
                    loading={updateMut.isPending}
                  >
                    {r.isActive ? t('admin.pricing.inactive') : t('admin.pricing.active')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMut.mutate({ id: r.id as number })}
                    loading={deleteMut.isPending}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Service opt-ins */}
      <Card padding="lg">
        <h3 className="mb-1 font-bold">{t('admin.pricing.services-title')}</h3>
        <p className="mb-3 text-xs text-text-secondary">{t('admin.pricing.services-subtitle')}</p>
        <div className="space-y-1">
          {services.slice(0, 20).map((s) => (
            <label
              key={s.id as number}
              className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-surface-muted"
            >
              <span className="text-sm">{localize(s.titleJson as never, locale)}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary">
                  {s.dynamicPricingEnabled
                    ? t('admin.pricing.enabled')
                    : t('admin.pricing.disabled')}
                </span>
                <input
                  type="checkbox"
                  checked={s.dynamicPricingEnabled as boolean}
                  onChange={(e) =>
                    flagMut.mutate({ serviceId: s.id as number, enabled: e.target.checked })
                  }
                  disabled={flagMut.isPending}
                />
              </span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
