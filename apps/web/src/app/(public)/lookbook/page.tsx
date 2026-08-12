'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/ui';
const SEASONS = [
  {
    id: 'summer',
    nameAr: 'صيف ٢٠٢٦',
    nameEn: 'Summer 2026',
    emoji: '☀️',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'eid',
    nameAr: 'أناقة العيد',
    nameEn: 'Eid Elegance',
    emoji: '🌙',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'wedding',
    nameAr: 'موسم الأعراس',
    nameEn: 'Wedding Season',
    emoji: '👰',
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'ramadan',
    nameAr: 'رمضان كريم',
    nameEn: 'Ramadan',
    emoji: '✨',
    color: 'from-purple-400 to-indigo-600',
  },
];

const LOOKS: Record<
  string,
  { title: string; desc: string; image: string; tags: string[]; link: string }[]
> = {
  summer: [
    {
      title: 'إطلالة شاطئية منعشة',
      desc: 'مكياج خفيف مقاوم للماء مع تسريحة شاطئية',
      image: '🧴',
      tags: ['مكياج', 'شعر', 'عناية'],
      link: '/services',
    },
    {
      title: 'عناية بالبشرة قبل الصيف',
      desc: 'تقشير وترطيب عميق لبشرة متألقة',
      image: '✨',
      tags: ['بشرة', 'عناية'],
      link: '/services',
    },
    {
      title: 'ألوان الصيف الجريئة',
      desc: 'مانيكير وباديكير بألوان الموسم',
      image: '💅',
      tags: ['أظافر', 'مانيكير'],
      link: '/services',
    },
  ],
  eid: [
    {
      title: 'إطلالة العيد الفاخرة',
      desc: 'مكياج سهرة مع تسريحة أنيقة',
      image: '💄',
      tags: ['مكياج', 'شعر'],
      link: '/services',
    },
    {
      title: 'حناء العيد',
      desc: 'نقوش حناء عصرية للمناسبات',
      image: '🌿',
      tags: ['حناء', 'مناسبات'],
      link: '/services',
    },
    {
      title: 'بشرة متألقة للعيد',
      desc: 'جلسة عناية متكاملة قبل العيد',
      image: '✨',
      tags: ['بشرة', 'عناية'],
      link: '/services',
    },
  ],
  wedding: [
    {
      title: 'إطلالة العروس الكاملة',
      desc: 'مكياج، شعر، وأظافر ليومكِ الكبير',
      image: '👰',
      tags: ['عرايس', 'مكياج', 'شعر'],
      link: '/bridal-concierge',
    },
    {
      title: 'جلسة تصوير العروس',
      desc: 'مكياج احترافي يدوم طوال اليوم',
      image: '📸',
      tags: ['مكياج', 'تصوير'],
      link: '/services',
    },
    {
      title: 'إطلالة أم العروس',
      desc: 'مكياج ناعم وأنيق لأم العروس',
      image: '💐',
      tags: ['مكياج', 'مناسبات'],
      link: '/services',
    },
  ],
  ramadan: [
    {
      title: 'عناية مسائية في رمضان',
      desc: 'جلسات عناية بالبشرة بعد الإفطار',
      image: '🌙',
      tags: ['بشرة', 'عناية'],
      link: '/services',
    },
    {
      title: 'إطلالة السحور',
      desc: 'مكياج ناعم وطبيعي للسهرات الرمضانية',
      image: '✨',
      tags: ['مكياج', 'سهرات'],
      link: '/services',
    },
  ],
};

export default function LookbookPage(): JSX.Element {
  const [season, setSeason] = useState('summer');

  const currentSeason = SEASONS.find((s) => s.id === season) || SEASONS[0]!;
  const looks = LOOKS[season] || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">📸 لوك بوك</h1>
        <p className="mt-2 text-text-secondary">
          استلهمي إطلالتكِ من أحدث صيحات الجمال لكل المناسبات
        </p>
      </div>

      <div className="flex justify-center gap-3 mb-10 flex-wrap">
        {SEASONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSeason(s.id)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${season === s.id ? `bg-gradient-to-r ${s.color} text-white shadow-lg` : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            <span>{s.emoji}</span> {s.nameAr}
          </button>
        ))}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {currentSeason.emoji} {currentSeason.nameAr}
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
                {look.title}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">{look.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {look.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600 dark:bg-brand-950"
                  >
                    {t}
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
        <h2 className="text-2xl font-bold">💖 إطلالات المجتمع</h2>
        <p className="mt-2 text-text-secondary">أحدث الإطلالات من مجتمع جالكسي بيوتي</p>
      </div>
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          {looks.map((l: Record<string, unknown>) => (
            <Card key={l.id as number} padding="lg" className="text-center">
              <span className="text-5xl">
                {l.category === 'makeup'
                  ? '💄'
                  : l.category === 'hair'
                    ? '💇‍♀️'
                    : l.category === 'nails'
                      ? '💅'
                      : '✨'}
              </span>
              <h3 className="font-bold mt-3">{l.title as string}</h3>
              <p className="text-xs text-text-secondary mt-1">
                {l.userName as string} · 👩‍🎨 {l.technicianName as string}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                ❤️ {l.votes as number} · {new Date(l.date as string).toLocaleDateString('ar-SA')}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
