'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function NewsletterPage(): JSX.Element {
  const { t } = useLocale();
  const { data: issues, isLoading } = api.newsletter.issues.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const subscribeMut = api.newsletter.subscribe.useMutation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const list = issues ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('newsletter.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('newsletter.subtitle')}</p>
        </div>

        {subscribed ? (
          <Card padding="lg" className="text-center border-2 border-green-300">
            <span className="text-6xl"></span>
            <h2 className="mt-4 text-xl font-bold">{t('newsletter.subscribedTitle')}</h2>
            <p className="text-text-secondary">{t('newsletter.subscribedMessage')}</p>
          </Card>
        ) : (
          <Card padding="lg">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.emailPlaceholder')}
                className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <Button
                onClick={() => {
                  if (email.includes('@'))
                    subscribeMut.mutate({ email }, { onSuccess: () => setSubscribed(true) });
                }}
                loading={subscribeMut.isPending}
              >
                {t('newsletter.subscribe')}
              </Button>
            </div>
          </Card>
        )}

        <h3 className="font-bold text-lg">{t('newsletter.pastIssues')}</h3>
        {isLoading ? (
          <CardListSkeleton count={3} />
        ) : (
          <div className="space-y-3">
            {list.map((i: Record<string, unknown>) => (
              <Card key={i.id as number} padding="md" className="flex items-center gap-4">
                <span className="text-3xl">{i.emoji as string}</span>
                <div className="flex-1">
                  <p className="font-bold">{i.titleAr as string}</p>
                  <p className="text-xs text-text-secondary">{i.subject as string}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-text-tertiary">{i.sentAt as string}</span>
                  <p className="text-xs font-bold text-green-600">
                    {t('newsletter.openRate', { count: i.openRate as number })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
