'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';

const TOGGLES = [
  { key: 'bookingReminders', label: 'تذكير بالمواعيد', desc: 'إشعارات قبل موعد الحجز' },
  { key: 'promotions', label: 'العروض والتخفيضات', desc: 'أحدث العروض والحملات الموسمية' },
  { key: 'tips', label: 'نصائح جمالية', desc: 'نصائح وإرشادات من خبراء التجميل' },
  { key: 'community', label: 'المجتمع', desc: 'منشورات وتفاعلات مجتمع الجمال' },
  { key: 'emailDigest', label: 'النشرة البريدية', desc: 'ملخص أسبوعي عبر البريد الإلكتروني' },
  { key: 'smsAlerts', label: 'تنبيهات SMS', desc: 'إشعارات عبر الرسائل النصية' },
];

export default function NotificationSettingsPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, refetch } = api.notificationPrefs.get.useQuery() as any;
  const updateMut = api.notificationPrefs.update.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', 'تم تحديث الإعدادات');
    },
  });
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data) setPrefs(data);
  }, [data]);

  const toggle = (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    updateMut.mutate({ [key]: updated[key] });
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
           إعدادات الإشعارات
        </h1>
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <Card padding="none">
            {TOGGLES.map((t) => (
              <div
                key={t.key}
                className="flex items-center justify-between border-b border-gray-100 p-4 last:border-0 dark:border-gray-800"
              >
                <div>
                  <p className="font-medium text-text-primary dark:text-gray-100">{t.label}</p>
                  <p className="text-xs text-text-secondary">{t.desc}</p>
                </div>
                <button
                  onClick={() => toggle(t.key)}
                  className={`h-6 w-11 rounded-full transition-colors ${prefs[t.key] ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${prefs[t.key] ? 'translate-x-5' : 'translate-x-0.5'}`}
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
