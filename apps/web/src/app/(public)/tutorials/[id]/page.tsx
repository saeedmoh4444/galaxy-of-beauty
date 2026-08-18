'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, DetailSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const DEFAULT_DIFFICULTY = {
  label: 'marketing.tutorials.difficulty-unknown' as TranslationKey,
  color: 'bg-gray-100 text-gray-700',
};
const DIFFICULTY_META: Record<string, { label: TranslationKey; color: string }> = {
  beginner: {
    label: 'marketing.tutorials.difficulty-beginner',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  intermediate: {
    label: 'marketing.tutorials.difficulty-intermediate',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  },
  advanced: {
    label: 'marketing.tutorials.difficulty-advanced',
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
};

const CATEGORY_META: Record<string, { label: TranslationKey; emoji: string }> = {
  makeup: { label: 'marketing.tutorials.cat-makeup', emoji: '' },
  hair: { label: 'marketing.tutorials.cat-hair', emoji: '‍️' },
  skincare: { label: 'marketing.tutorials.cat-skincare', emoji: '' },
  nails: { label: 'marketing.tutorials.cat-nails', emoji: '' },
};

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function TutorialDetailPage(): JSX.Element {
  const { t } = useLocale();
  const params = useParams();
  const id = parseInt(params?.id as string, 10);

  const {
    data: tutorial,
    isLoading,
    isError,
    refetch,
  } = api.tutorials.getById.useQuery({ id }, { enabled: !isNaN(id) }) as {
    data: Record<string, unknown> | null | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isNaN(id)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <ErrorAlert message={t('marketing.tutorials.invalid-id')} />
        <Link href="/tutorials" className="mt-4 inline-block">
          <Button size="sm">{t('marketing.tutorials.back-to-lessons')}</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !tutorial) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <ErrorAlert
          message={
            isError ? t('marketing.tutorials.load-error') : t('marketing.tutorials.not-found')
          }
          onRetry={isError ? () => refetch() : undefined}
        />
        <Link href="/tutorials" className="mt-4 inline-block">
          <Button size="sm">{t('marketing.tutorials.back-to-lessons')}</Button>
        </Link>
      </div>
    );
  }

  const title = (tutorial.titleAr as string) ?? (tutorial.titleEn as string) ?? '';
  const desc = (tutorial.descAr as string) ?? (tutorial.descEn as string) ?? '';
  const videoUrl = (tutorial.videoUrl as string) ?? '';
  const duration = (tutorial.duration as string) ?? '';
  const category = (tutorial.category as string) ?? '';
  const difficulty = (tutorial.difficulty as string) ?? 'beginner';
  const tags: string[] = (tutorial.tags as string[]) ?? [];
  const authorName = (tutorial.authorName as string) ?? '';
  const authorTitle = (tutorial.authorTitleAr as string) ?? '';
  const views = (tutorial.views as number) ?? 0;
  const likes = (tutorial.likes as number) ?? 0;
  const diffMeta = DIFFICULTY_META[difficulty] ?? DEFAULT_DIFFICULTY;
  const catMeta = CATEGORY_META[category] ?? { label: category as TranslationKey, emoji: '' };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs
        items={[
          { label: t('marketing.tutorials.lessons-label'), href: '/tutorials' },
          { label: title },
        ]}
      />

      {/* Video Player */}
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl"
        style={{ paddingBottom: '56.25%' }}
      >
        {videoUrl ? (
          <iframe
            src={videoUrl}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40">
            <div className="text-center">
              <span className="text-6xl"></span>
              <p className="mt-2">{t('marketing.tutorials.video-unavailable')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="mt-6">
        {/* Title & Meta */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-3xl">
              {title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${diffMeta.color}`}>
                {t(diffMeta.label)}
              </span>
              <span className="text-sm text-gray-500">
                {catMeta.emoji} {t(catMeta.label)}
              </span>
              <span className="text-sm text-gray-500">️ {duration}</span>
              <span className="text-sm text-gray-500">
                ️ {t('marketing.tutorials.views-label', { count: formatViews(views) })}
              </span>
              <span className="text-sm text-gray-500">️ {likes}</span>
            </div>
          </div>
        </div>

        {/* Author Card */}
        <Card padding="md" className="mt-5 inline-flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-lg font-bold">
            {authorName[0]}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-gray-100">{authorName}</p>
            {authorTitle && <p className="text-xs text-gray-500">{authorTitle}</p>}
          </div>
        </Card>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {desc && (
          <div className="mt-6 rounded-2xl bg-gray-50 p-5 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              {t('marketing.tutorials.desc-title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {desc}
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 rounded-2xl bg-gradient-to-r from-brand-500 to-purple-500 p-6 text-center text-white">
        <p className="text-xl font-bold">{t('marketing.tutorials.cta-title')}</p>
        <p className="mt-1 text-white/80">{t('marketing.tutorials.cta-desc')}</p>
        <Link href="/tutorials" className="mt-4 inline-block">
          <span className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2 text-sm font-bold backdrop-blur hover:bg-white/30 transition-colors">
            {t('marketing.tutorials.cta-link')}
          </span>
        </Link>
      </div>
    </div>
  );
}
