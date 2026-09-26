'use client';

import Link from 'next/link';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { seasonalBannerFor, localize } from '@galaxy/shared';
import type { SeasonalBannerTheme, TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

const THEMES: Record<
  SeasonalBannerTheme,
  { emoji: string; gradient: string; titleKey: TranslationKey }
> = {
  ramadan: {
    emoji: '🌙',
    gradient:
      'from-emerald-100 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-950',
    titleKey: 'seasonal.banner.ramadan',
  },
  eid: {
    emoji: '✨',
    gradient:
      'from-amber-100 via-yellow-50 to-amber-100 dark:from-amber-950 dark:via-yellow-950 dark:to-amber-950',
    titleKey: 'seasonal.banner.eid',
  },
  graduation: {
    emoji: '🎓',
    gradient:
      'from-violet-100 via-purple-50 to-violet-100 dark:from-violet-950 dark:via-purple-950 dark:to-violet-950',
    titleKey: 'seasonal.banner.graduation',
  },
  valentine: {
    emoji: '💗',
    gradient:
      'from-rose-100 via-pink-50 to-rose-100 dark:from-rose-950 dark:via-pink-950 dark:to-rose-950',
    titleKey: 'seasonal.banner.valentine',
  },
};

interface SeasonalItem {
  id?: number;
  nameJson?: { ar?: string; en?: string };
  pricePremium?: number | string;
}

// 1.4 Seasonal & Event Services — themed banner. Hidden unless a season is
// active AND the catalog has items (seasonalBannerFor decides both).
export function SeasonalBanner(): JSX.Element | null {
  const { t, locale } = useLocale();
  const { data } = api.seasonalServices.active.useQuery(undefined, { retry: false });
  const payload = data as { seasons?: string[]; items?: SeasonalItem[] } | undefined;
  const banner = seasonalBannerFor(payload?.seasons ?? [], payload?.items?.length ?? 0);
  if (!banner) return null;

  const theme = THEMES[banner.theme];
  const items = payload?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-4">
      <Link href="/seasonal-calendar" className="block">
        <div
          data-testid="seasonal-banner"
          className={`flex items-center justify-between gap-3 rounded-2xl border border-edge-muted bg-gradient-to-l ${theme.gradient} px-5 py-4 transition-shadow hover:shadow-md`}
        >
          <div>
            <p className="text-sm font-extrabold text-text-primary">
              {theme.emoji} {t(theme.titleKey, { count: banner.itemCount })}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-text-secondary">
              {items
                .slice(0, 3)
                .map((i) => localize(i.nameJson, locale))
                .join(' · ')}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/70 px-4 py-2 text-xs font-bold text-text-primary dark:bg-black/30">
            {t('seasonal.banner.cta')}
          </span>
        </div>
      </Link>
    </div>
  );
}
