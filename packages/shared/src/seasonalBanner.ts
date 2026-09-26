// ── 1.4 Seasonal & Event Services — themed banner decision (pure) ──
// Consumed by the web + RN seasonal banners and the seasonal-calendar page.
// The banner shows only when a season is active AND the catalog has items.
// Priority when seasons overlap: EID > RAMADAN > VALENTINE > GRADUATION.

export type SeasonalBannerTheme = 'ramadan' | 'eid' | 'graduation' | 'valentine';

export interface SeasonalBannerResult {
  theme: SeasonalBannerTheme;
  season: string;
  itemCount: number;
}

const THEME_BY_SEASON: Record<string, SeasonalBannerTheme> = {
  RAMADAN: 'ramadan',
  EID: 'eid',
  GRADUATION: 'graduation',
  VALENTINE: 'valentine',
};

const PRIORITY = ['EID', 'RAMADAN', 'VALENTINE', 'GRADUATION'] as const;

export function seasonalBannerFor(
  seasons: string[],
  itemCount: number,
): SeasonalBannerResult | null {
  if (seasons.length === 0 || itemCount === 0) return null;
  const picked = PRIORITY.find((s) => seasons.includes(s)) ?? seasons[0]!;
  return {
    theme: THEME_BY_SEASON[picked] ?? 'graduation',
    season: picked,
    itemCount,
  };
}
