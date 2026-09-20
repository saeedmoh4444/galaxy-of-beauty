'use client';

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';
import { useToast } from '@galaxy/ui';

const TOGGLES: { key: string; label: TranslationKey; desc: TranslationKey }[] = [
  {
    key: 'bookingReminders',
    label: 'notificationSettings.toggle.bookingReminders',
    desc: 'notificationSettings.desc.bookingReminders',
  },
  {
    key: 'promotions',
    label: 'notificationSettings.toggle.promotions',
    desc: 'notificationSettings.desc.promotions',
  },
  {
    key: 'tips',
    label: 'notificationSettings.toggle.tips',
    desc: 'notificationSettings.desc.tips',
  },
  {
    key: 'community',
    label: 'notificationSettings.toggle.community',
    desc: 'notificationSettings.desc.community',
  },
  {
    key: 'emailDigest',
    label: 'notificationSettings.toggle.emailDigest',
    desc: 'notificationSettings.desc.emailDigest',
  },
  {
    key: 'smsAlerts',
    label: 'notificationSettings.toggle.smsAlerts',
    desc: 'notificationSettings.desc.smsAlerts',
  },
  {
    key: 'whatsappAlerts',
    label: 'notificationSettings.toggle.whatsappAlerts',
    desc: 'notificationSettings.desc.whatsappAlerts',
  },
];

export default function NotificationSettingsPage(): JSX.Element {
  const { t } = useLocale();
  const { addToast } = useToast();
  const { data, isLoading, refetch } = api.notificationPrefs.get.useQuery();
  const updateMut = api.notificationPrefs.update.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', t('notificationSettings.toast.updated'));
    },
  });
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  // ── 6.2 PDPL — consent records ──────────────────────────
  const { data: consentData, refetch: refetchConsents } = api.users.consent.mine.useQuery();
  const consents = (consentData ?? []) as Array<{
    type: string;
    granted: boolean;
    updatedAt: Date;
  }>;
  const consentMut = api.users.consent.set.useMutation({
    onSuccess: () => {
      refetchConsents();
      addToast('success', t('notificationSettings.toast.updated'));
    },
  });
  const setConsent = (type: string, granted: boolean) => {
    consentMut.mutate({ type, granted });
  };

  useEffect(() => {
    if (data) setPrefs(data as Record<string, boolean>);
  }, [data]);

  const toggle = (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    updateMut.mutate({ [key]: updated[key] });
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">{t('notificationSettings.title')}</h1>
        {isLoading ? (
          <CardListSkeleton count={6} />
        ) : (
          <Card padding="none">
            {TOGGLES.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between border-b border-edge-muted p-4 last:border-0"
              >
                <div>
                  <p className="font-medium text-text-primary">{t(item.label)}</p>
                  <p className="text-xs text-text-secondary">{t(item.desc)}</p>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`h-6 w-11 rounded-full transition-colors ${prefs[item.key] ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-surface-elevated shadow transition-transform ${prefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            ))}
          </Card>
        )}

        {/* ── 6.2 PDPL — consent management ─────────────────── */}
        <Card padding="lg">
          <h2 className="font-bold text-text-primary">{t('notificationSettings.consent.title')}</h2>
          <p className="mt-1 text-xs text-text-secondary">
            {t('notificationSettings.consent.subtitle')}
          </p>
          <div className="mt-4 space-y-3">
            {consents.length === 0 ? (
              <p className="text-xs text-text-secondary">
                {t('notificationSettings.consent.no-records')}
              </p>
            ) : (
              consents.map((c) => (
                <div
                  key={c.type}
                  className="flex items-center justify-between border-b border-edge-muted pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      {c.type === 'marketing'
                        ? t('notificationSettings.consent.marketing-label')
                        : c.type}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {c.granted
                        ? `${t('notificationSettings.consent.granted-at')}: ${new Date(c.updatedAt).toLocaleDateString('ar-SA')}`
                        : t('notificationSettings.consent.marketing-desc')}
                    </p>
                  </div>
                  <button
                    onClick={() => setConsent(c.type, !c.granted)}
                    className={`h-6 w-11 rounded-full transition-colors ${c.granted ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-surface-elevated shadow transition-transform ${c.granted ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
              ))
            )}
            {consents.every((c) => c.type !== 'marketing') && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">
                    {t('notificationSettings.consent.marketing-label')}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('notificationSettings.consent.marketing-desc')}
                  </p>
                </div>
                <button
                  onClick={() => setConsent('marketing', true)}
                  className="h-6 w-11 rounded-full bg-gray-300 transition-colors dark:bg-gray-600"
                >
                  <div className="h-5 w-5 rounded-full bg-surface-elevated shadow transition-transform translate-x-0.5" />
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
