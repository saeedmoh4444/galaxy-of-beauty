'use client';

import { useEffect, useState } from 'react';
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
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('notificationSettings.title')}
        </h1>
        {isLoading ? (
          <CardListSkeleton count={6} />
        ) : (
          <Card padding="none">
            {TOGGLES.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between border-b border-gray-100 p-4 last:border-0 dark:border-gray-800"
              >
                <div>
                  <p className="font-medium text-text-primary dark:text-gray-100">
                    {t(item.label)}
                  </p>
                  <p className="text-xs text-text-secondary">{t(item.desc)}</p>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`h-6 w-11 rounded-full transition-colors ${prefs[item.key] ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${prefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            ))}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
