'use client';

import { api } from '@/lib/trpc';
import { Card, GridSkeleton, ErrorAlert, EmptyState } from '@galaxy/ui';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

interface Badge {
  id: number;
  key: string;
  nameJson: Record<string, string>;
  iconUrl: string | null;
  descriptionJson?: Record<string, string>;
}

const BADGE_META: Record<string, { emoji: string; gradient: string; descKey: TranslationKey }> = {
  top_rated: {
    emoji: '',
    gradient: 'from-amber-400 to-yellow-500',
    descKey: 'marketing.technician-badges.badge-top-rated',
  },
  most_booked: {
    emoji: '',
    gradient: 'from-red-400 to-orange-500',
    descKey: 'marketing.technician-badges.badge-most-booked',
  },
  quick_response: {
    emoji: '',
    gradient: 'from-cyan-400 to-blue-500',
    descKey: 'marketing.technician-badges.badge-quick-response',
  },
  premium: {
    emoji: '',
    gradient: 'from-purple-400 to-indigo-500',
    descKey: 'marketing.technician-badges.badge-premium',
  },
  certified: {
    emoji: '',
    gradient: 'from-green-400 to-emerald-500',
    descKey: 'marketing.technician-badges.badge-certified',
  },
  newcomer: {
    emoji: '',
    gradient: 'from-lime-400 to-green-500',
    descKey: 'marketing.technician-badges.badge-newcomer',
  },
  loyal: {
    emoji: '',
    gradient: 'from-pink-400 to-rose-500',
    descKey: 'marketing.technician-badges.badge-loyal',
  },
  mentor: {
    emoji: '',
    gradient: 'from-teal-400 to-cyan-500',
    descKey: 'marketing.technician-badges.badge-mentor',
  },
};

function getBadgeMeta(key: string): { emoji: string; gradient: string; descKey: TranslationKey } {
  return (
    BADGE_META[key] ?? {
      emoji: '️',
      gradient: 'from-gray-400 to-gray-500',
      descKey: 'marketing.technician-badges.badge-fallback',
    }
  );
}

export default function TechnicianBadgesPage(): JSX.Element {
  const { t } = useLocale();
  const {
    data: badges,
    isLoading,
    isError,
    refetch,
  } = api.technicianBadges.list.useQuery() as {
    data: Badge[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const allBadges = badges ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.technician-badges.title')}
        </h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          {t('marketing.technician-badges.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <GridSkeleton count={8} />
      ) : isError ? (
        <ErrorAlert
          message={t('marketing.technician-badges.load-error')}
          onRetry={() => refetch()}
        />
      ) : allBadges.length === 0 ? (
        <EmptyState
          title={t('marketing.technician-badges.empty-title')}
          description={t('marketing.technician-badges.empty-desc')}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {allBadges.map((badge) => {
            const meta = getBadgeMeta(badge.key);
            const name = badge.nameJson?.ar ?? badge.nameJson?.en ?? badge.key;
            const desc = badge.descriptionJson?.ar ?? badge.descriptionJson?.en ?? t(meta.descKey);

            return (
              <Card
                key={badge.id}
                padding="lg"
                className="group text-center transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div
                  className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-4xl shadow-lg transition-transform group-hover:scale-110`}
                >
                  {badge.iconUrl ? (
                    <Image src={badge.iconUrl} alt={name} fill className="object-contain p-4" />
                  ) : (
                    meta.emoji
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold text-text-primary dark:text-gray-100">
                  {name}
                </h3>
                <p className="mt-1 text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
                  {desc}
                </p>
                <div
                  className={`mt-3 inline-block rounded-full bg-gradient-to-r ${meta.gradient} px-3 py-0.5 text-[10px] font-bold text-white`}
                >
                  {badge.key.replace(/_/g, ' ').toUpperCase()}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 p-6 text-center text-white">
        <p className="text-2xl font-bold">{t('marketing.technician-badges.cta-title')}</p>
        <p className="mt-1 text-white/80">{t('marketing.technician-badges.cta-desc')}</p>
        <Link href="/technicians" className="mt-4 inline-block">
          <span className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2 text-sm font-bold backdrop-blur hover:bg-white/30 transition-colors">
            {t('marketing.technician-badges.cta-link')}
          </span>
        </Link>
      </div>
    </div>
  );
}
