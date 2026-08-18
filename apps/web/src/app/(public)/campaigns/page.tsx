'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { api } from '@/lib/trpc';
import {
  Card,
  GridSkeleton,
  ErrorAlert,
  EmptyState,
  formatCurrency,
  CAMPAIGN_POLL_INTERVAL_MS,
} from '@galaxy/ui';
import Link from 'next/link';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Campaign {
  id: number;
  nameJson: Record<string, string>;
  descriptionJson: Record<string, string> | null;
  imageUrl: string | null;
  discountType: string;
  discountValue: number;
  promoCode: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

function Countdown({ endsAt }: { endsAt: string }) {
  const { t } = useLocale();
  const [label, setLabel] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel(t('marketing.campaigns.ended'));
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      if (d > 0) setLabel(t('marketing.campaigns.days-left', { count: d }));
      else if (h > 0) setLabel(t('marketing.campaigns.hours-left', { count: h }));
      else setLabel(t('marketing.campaigns.ending-soon'));
    };
    update();
    const i = setInterval(update, CAMPAIGN_POLL_INTERVAL_MS);
    return () => clearInterval(i);
  }, [endsAt, t]);
  return <span className="text-xs font-semibold text-red-500 animate-pulse"> {label}</span>;
}

export default function CampaignsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const {
    data: active,
    isLoading: aLoad,
    isError: aErr,
    refetch: aRef,
  } = api.campaigns.active.useQuery() as {
    data: Campaign[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: upcoming, isLoading: uLoad } = api.campaigns.upcoming.useQuery() as {
    data: Campaign[] | undefined;
    isLoading: boolean;
  };

  const activeList = active ?? [];
  const upcomingList = upcoming ?? [];
  const isLoading = aLoad || uLoad;
  const isEmpty = activeList.length === 0 && upcomingList.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.campaigns.title')}
        </h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          {t('marketing.campaigns.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : aErr ? (
        <ErrorAlert message={t('marketing.campaigns.load-error')} onRetry={() => aRef()} />
      ) : isEmpty ? (
        <EmptyState
          title={t('marketing.campaigns.no-campaigns')}
          description={t('marketing.campaigns.no-campaigns-desc')}
          action={{
            label: t('marketing.campaigns.browse-services'),
            onPress: () => window.location.assign('/services'),
          }}
        />
      ) : (
        <>
          {activeList.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-xl font-bold">{t('marketing.campaigns.active-now')}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeList.map((c) => (
                  <Card
                    key={c.id}
                    padding="none"
                    className="overflow-hidden border-2 border-red-200 dark:border-red-800 hover:shadow-xl transition-all"
                  >
                    <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-red-100 to-amber-100 dark:from-red-950 dark:to-amber-950 text-5xl">
                      {c.imageUrl ? (
                        <Image src={c.imageUrl} alt="" fill className="object-cover" />
                      ) : (
                        <span></span>
                      )}
                      <span className="absolute top-3 right-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white animate-pulse">
                        {t('marketing.campaigns.active')}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold">{localize(c.nameJson, locale)}</h3>
                      <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                        {localize(c.descriptionJson, locale)}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-2xl font-extrabold text-red-600">
                          {c.discountType === 'percent'
                            ? `-${c.discountValue}%`
                            : `-${formatCurrency(c.discountValue)}`}
                        </span>
                        <Countdown endsAt={c.endsAt} />
                      </div>
                      {c.promoCode && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-surface-muted dark:bg-gray-800 p-2">
                          <span className="text-xs text-text-secondary">
                            {t('marketing.campaigns.code-label')}
                          </span>
                          <code className="font-mono font-bold text-brand-600 text-sm">
                            {c.promoCode}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(c.promoCode ?? '');
                            }}
                            className="mr-auto text-xs text-brand-500 hover:text-brand-700"
                          >
                            {t('marketing.campaigns.copy')}
                          </button>
                        </div>
                      )}
                      <Link
                        href="/services"
                        className="mt-3 block w-full rounded-lg bg-brand-600 py-2 text-center text-sm font-medium text-white hover:bg-brand-700 transition-colors"
                      >
                        {t('marketing.campaigns.use-offer')}
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {upcomingList.length > 0 && (
            <div>
              <h2 className="mb-6 text-xl font-bold">{t('marketing.campaigns.coming-soon')}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingList.map((c) => (
                  <Card
                    key={c.id}
                    padding="none"
                    className="overflow-hidden opacity-70 hover:opacity-100 transition-all"
                  >
                    <div className="flex h-36 items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 text-5xl">
                      <span></span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold">{localize(c.nameJson, locale)}</h3>
                      <p className="mt-2 text-sm text-brand-600 font-semibold">
                        {t('marketing.campaigns.starts')}
                        {new Date(c.startsAt).toLocaleDateString(
                          locale === 'ar' ? 'ar-SA' : 'en-GB',
                          {
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </p>
                      <span className="inline-block mt-2 rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                        {c.discountType === 'percent'
                          ? `-${c.discountValue}%`
                          : `-${formatCurrency(c.discountValue)}`}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
