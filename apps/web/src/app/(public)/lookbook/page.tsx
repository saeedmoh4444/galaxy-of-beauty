'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
const SEASONS = [
  {
    id: 'summer',
    nameAr: 'marketing.lookbook.season-summer-ar',
    nameEn: 'marketing.lookbook.season-summer-en',
    emoji: '️',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'eid',
    nameAr: 'marketing.lookbook.season-eid-ar',
    nameEn: 'marketing.lookbook.season-eid-en',
    emoji: '',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'wedding',
    nameAr: 'marketing.lookbook.season-wedding-ar',
    nameEn: 'marketing.lookbook.season-wedding-en',
    emoji: '',
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'ramadan',
    nameAr: 'marketing.lookbook.season-ramadan-ar',
    nameEn: 'marketing.lookbook.season-ramadan-en',
    emoji: '',
    color: 'from-purple-400 to-indigo-600',
  },
] as const;

const LOOKS = {
  summer: [
    {
      title: 'marketing.lookbook.look-summer-beach-title',
      desc: 'marketing.lookbook.look-summer-beach-desc',
      image: '',
      tags: [
        'marketing.lookbook.tag-makeup',
        'marketing.lookbook.tag-hair',
        'marketing.lookbook.tag-care',
      ],
      link: '/services',
    },
    {
      title: 'marketing.lookbook.look-summer-skin-title',
      desc: 'marketing.lookbook.look-summer-skin-desc',
      image: '',
      tags: ['marketing.lookbook.tag-skin', 'marketing.lookbook.tag-care'],
      link: '/services',
    },
    {
      title: 'marketing.lookbook.look-summer-colors-title',
      desc: 'marketing.lookbook.look-summer-colors-desc',
      image: '',
      tags: ['marketing.lookbook.tag-nails', 'marketing.lookbook.tag-manicure'],
      link: '/services',
    },
  ],
  eid: [
    {
      title: 'marketing.lookbook.look-eid-luxury-title',
      desc: 'marketing.lookbook.look-eid-luxury-desc',
      image: '',
      tags: ['marketing.lookbook.tag-makeup', 'marketing.lookbook.tag-hair'],
      link: '/services',
    },
    {
      title: 'marketing.lookbook.look-eid-henna-title',
      desc: 'marketing.lookbook.look-eid-henna-desc',
      image: '',
      tags: ['marketing.lookbook.tag-henna', 'marketing.lookbook.tag-occasions'],
      link: '/services',
    },
    {
      title: 'marketing.lookbook.look-eid-glow-title',
      desc: 'marketing.lookbook.look-eid-glow-desc',
      image: '',
      tags: ['marketing.lookbook.tag-skin', 'marketing.lookbook.tag-care'],
      link: '/services',
    },
  ],
  wedding: [
    {
      title: 'marketing.lookbook.look-wedding-bride-title',
      desc: 'marketing.lookbook.look-wedding-bride-desc',
      image: '',
      tags: [
        'marketing.lookbook.tag-brides',
        'marketing.lookbook.tag-makeup',
        'marketing.lookbook.tag-hair',
      ],
      link: '/bridal-concierge',
    },
    {
      title: 'marketing.lookbook.look-wedding-photo-title',
      desc: 'marketing.lookbook.look-wedding-photo-desc',
      image: '',
      tags: ['marketing.lookbook.tag-makeup', 'marketing.lookbook.tag-photo'],
      link: '/services',
    },
    {
      title: 'marketing.lookbook.look-wedding-mother-title',
      desc: 'marketing.lookbook.look-wedding-mother-desc',
      image: '',
      tags: ['marketing.lookbook.tag-makeup', 'marketing.lookbook.tag-occasions'],
      link: '/services',
    },
  ],
  ramadan: [
    {
      title: 'marketing.lookbook.look-ramadan-evening-title',
      desc: 'marketing.lookbook.look-ramadan-evening-desc',
      image: '',
      tags: ['marketing.lookbook.tag-skin', 'marketing.lookbook.tag-care'],
      link: '/services',
    },
    {
      title: 'marketing.lookbook.look-ramadan-suhoor-title',
      desc: 'marketing.lookbook.look-ramadan-suhoor-desc',
      image: '',
      tags: ['marketing.lookbook.tag-makeup', 'marketing.lookbook.tag-evenings'],
      link: '/services',
    },
  ],
} as const;

type Look = (typeof LOOKS)[keyof typeof LOOKS][number];
const looksMap: Record<string, readonly Look[] | undefined> = LOOKS;

export default function LookbookPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [season, setSeason] = useState('summer');

  const currentSeason = SEASONS.find((s) => s.id === season) || SEASONS[0]!;
  const looks = looksMap[season] ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.lookbook.title')}
        </h1>
        <p className="mt-2 text-text-secondary">{t('marketing.lookbook.subtitle')}</p>
      </div>

      <div className="flex justify-center gap-3 mb-10 flex-wrap">
        {SEASONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSeason(s.id)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${season === s.id ? `bg-gradient-to-r ${s.color} text-white shadow-lg` : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            <span>{s.emoji}</span> {t(locale === 'ar' ? s.nameAr : s.nameEn)}
          </button>
        ))}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {currentSeason.emoji} {t(locale === 'ar' ? currentSeason.nameAr : currentSeason.nameEn)}
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {looks.map((look, i) => (
          <Link key={i} href={look.link}>
            <Card hover padding="lg" className="group h-full">
              <div
                className={`flex h-48 items-center justify-center rounded-xl bg-gradient-to-br ${currentSeason.color} text-7xl`}
              >
                <span>{look.image}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-text-primary group-hover:text-brand-600 dark:text-gray-100">
                {t(look.title)}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">{t(look.desc)}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {look.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600 dark:bg-brand-950"
                  >
                    {t(tag)}
                  </span>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <CommunityLooks />
    </div>
  );
}

function CommunityLooks(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading } = api.lookOfTheDay.feed.useQuery({ page: 1, limit: 6 }) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const looks = (data?.items as Array<Record<string, unknown>>) ?? [];
  if (looks.length === 0 && !isLoading) return <></>;
  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">{t('marketing.lookbook.community-title')}</h2>
        <p className="mt-2 text-text-secondary">{t('marketing.lookbook.community-subtitle')}</p>
      </div>
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          {looks.map((l: Record<string, unknown>) => (
            <Card key={l.id as number} padding="lg" className="text-center">
              <span className="text-5xl">
                {l.category === 'makeup'
                  ? ''
                  : l.category === 'hair'
                    ? '‍️'
                    : l.category === 'nails'
                      ? ''
                      : ''}
              </span>
              <h3 className="font-bold mt-3">{l.title as string}</h3>
              <p className="text-xs text-text-secondary mt-1">
                {l.userName as string} · ‍ {l.technicianName as string}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                ️ {l.votes as number} ·{' '}
                {new Date(l.date as string).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB')}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
