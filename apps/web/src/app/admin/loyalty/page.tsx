'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminLoyaltyPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const utils = api.useUtils();
  const { data: rewards, isLoading: rwLoading } = api.loyalty.listRewards.useQuery(undefined, {
    enabled: isAuthenticated,
  }) as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };

  // 8.2 — boost events CRUD.
  const { data: boosts, isLoading: boostLoading } = api.loyalty.listBoosts.useQuery(undefined, {
    enabled: isAuthenticated,
  }) as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const createBoost = api.loyalty.createBoost.useMutation({
    onSuccess: () => {
      setForm({ nameAr: '', nameEn: '', multiplier: '2', startsAt: '', endsAt: '' });
      void utils.loyalty.listBoosts.invalidate();
    },
  });
  const deleteBoost = api.loyalty.deleteBoost.useMutation({
    onSuccess: () => void utils.loyalty.listBoosts.invalidate(),
  });
  const [form, setForm] = useState({
    nameAr: '',
    nameEn: '',
    multiplier: '2',
    startsAt: '',
    endsAt: '',
  });

  const handleCreate = () => {
    if (!form.nameAr || !form.nameEn || !form.startsAt || !form.endsAt) return;
    createBoost.mutate({
      nameJson: { ar: form.nameAr, en: form.nameEn },
      multiplier: Number(form.multiplier),
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
    });
  };

  const fmt = (d: unknown) =>
    new Date(String(d)).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB');

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.loyalty.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.loyalty.subtitle')}</p>
        </div>

        <div>
          <Card padding="lg">
            <h3 className="font-bold mb-3">{t('admin.loyalty.available-rewards')}</h3>
            {rwLoading ? (
              <CardListSkeleton count={4} />
            ) : !(rewards ?? []).length ? (
              <p className="text-sm text-text-tertiary">{t('admin.loyalty.no-rewards')}</p>
            ) : (
              <div className="space-y-2">
                {(rewards ?? []).map((r: Record<string, unknown>) => (
                  <div
                    key={r.id as number}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-bold text-sm">
                        {(r.nameAr as string) ?? (r.nameJson as Record<string, string>)?.ar}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {(r.descriptionAr as string) ?? ''}
                      </p>
                    </div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {t('admin.loyalty.points-cost', { points: r.pointsCost as number })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* 8.2 — boost events CRUD */}
        <div>
          <Card padding="lg">
            <h3 className="font-bold mb-3">{t('admin.loyalty.boosts')}</h3>
            {boostLoading ? (
              <CardListSkeleton count={2} />
            ) : !(boosts ?? []).length ? (
              <p className="text-sm text-text-tertiary">{t('admin.loyalty.no-boosts')}</p>
            ) : (
              <div className="space-y-2">
                {(boosts ?? []).map((b: Record<string, unknown>) => (
                  <div
                    key={b.id as number}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-bold text-sm">
                        {(b.nameJson as Record<string, string>)?.ar} ×{Number(b.multiplier)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t('admin.loyalty.boost-window', {
                          start: fmt(b.startsAt),
                          end: fmt(b.endsAt),
                        })}
                        {b.isActive ? '' : ` · ${String(b.isActive)}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBoost.mutate({ id: b.id as number })}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300"
                    >
                      {t('admin.loyalty.boost-delete')}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-2">
              <input
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                placeholder={t('admin.loyalty.boost-name-ar')}
                className="rounded-lg border p-2 text-sm"
              />
              <input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder={t('admin.loyalty.boost-name-en')}
                className="rounded-lg border p-2 text-sm"
              />
              <input
                type="number"
                min="1.1"
                max="5"
                step="0.1"
                value={form.multiplier}
                onChange={(e) => setForm({ ...form, multiplier: e.target.value })}
                placeholder={t('admin.loyalty.boost-multiplier')}
                className="rounded-lg border p-2 text-sm"
              />
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="rounded-lg border p-2 text-sm"
              />
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="rounded-lg border p-2 text-sm"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={createBoost.isPending}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {t('admin.loyalty.boost-create')}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
