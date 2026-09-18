'use client';

import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

type JsonRecord = Record<string, unknown>;

const SHADE_LABELS: Record<string, TranslationKey> = {
  porcelain: 'beautyDna.shade.porcelain',
  ivory: 'beautyDna.shade.ivory',
  sand: 'beautyDna.shade.sand',
  beige: 'beautyDna.shade.beige',
  golden: 'beautyDna.shade.golden',
  mocha: 'beautyDna.shade.mocha',
  espresso: 'beautyDna.shade.espresso',
  light: 'beautyDna.shade.light',
  deep: 'beautyDna.shade.deep',
  olive: 'beautyDna.shade.olive',
};

const FAMILY_LABELS: Record<string, TranslationKey> = {
  floral: 'beautyDna.family.floral',
  citrus: 'beautyDna.family.citrus',
  woody: 'beautyDna.family.woody',
  fresh: 'beautyDna.family.fresh',
  sweet: 'beautyDna.family.sweet',
  oriental: 'beautyDna.family.oriental',
};

function pickName(nameJson: unknown, locale: string): string {
  const n = (nameJson ?? {}) as JsonRecord;
  const key = locale === 'ar' ? 'ar' : 'en';
  return (n[key] as string) || (n['en'] as string) || '';
}

/** Stable match reasons → i18n keys (beautyDna.reason.*). */
function reasonLabel(t: (k: TranslationKey) => string, code: string): string {
  const key = `beautyDna.reason.${code}` as TranslationKey;
  const label = t(key);
  // t() falls back to the raw key when untranslated — hide those.
  return label === key ? code : label;
}

function MatchPctBadge({ pct }: { pct: number }): JSX.Element {
  return (
    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
      {pct}%
    </span>
  );
}

function MissingHint({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="rounded-xl bg-surface-muted p-4 text-sm text-text-secondary">{children}</div>
  );
}

/**
 * 3.1 Beauty DNA — Skin/Hair/Fragrance Match sections. Three independent
 * queries over the deterministic beautyDna router; rendered on the
 * beauty-profile page below the editor.
 */
export function BeautyDnaMatches(): JSX.Element {
  const { t, locale } = useLocale();
  const skinQ = api.beautyDna.skinMatch.useQuery({});
  const hairQ = api.beautyDna.hairMatch.useQuery({});
  const fragranceQ = api.beautyDna.fragranceMatch.useQuery({});

  const skin = (skinQ.data ?? {}) as JsonRecord;
  const hair = (hairQ.data ?? {}) as JsonRecord;
  const fragrance = (fragranceQ.data ?? {}) as JsonRecord;
  const skinMatches = (skin.matches as Array<JsonRecord>) ?? [];
  const hairMatches = (hair.matches as Array<JsonRecord>) ?? [];
  const fragranceMatches = (fragrance.matches as Array<JsonRecord>) ?? [];

  return (
    <div className="space-y-6">
      {/* Skin Match */}
      <Card padding="md">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-text-primary">
          🧴 {t('beautyDna.skinMatch.title')}
        </h3>
        {(skin.missing as string[] | undefined)?.includes('skinTone') ? (
          <MissingHint>
            {t('beautyDna.missing.skinTone')}{' '}
            <a href="/skin-analysis" className="font-semibold text-brand-600 underline">
              {t('beautyDna.missing.skinToneLink')}
            </a>
          </MissingHint>
        ) : (
          <div className="space-y-2">
            {skinMatches.map((m) => {
              const product = (m.product ?? {}) as JsonRecord;
              const attrs = (product.attributes ?? {}) as JsonRecord;
              return (
                <div
                  key={product.id as number}
                  className="flex items-center gap-3 rounded-xl bg-surface-elevated p-3"
                >
                  <span
                    className="inline-block h-5 w-5 shrink-0 rounded-full border border-edge"
                    style={{ backgroundColor: (attrs.shadeHex as string) || '#ccc' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {pickName(product.nameJson, locale)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {((attrs.shade as string) &&
                        (SHADE_LABELS[attrs.shade as string]
                          ? t(SHADE_LABELS[attrs.shade as string])
                          : (attrs.shade as string))) ||
                        ''}
                      {product.brand ? ` · ${product.brand as string}` : ''}
                    </p>
                    <p className="mt-0.5 text-[10px] text-text-tertiary">
                      {(m.reasons as string[]).map((r) => reasonLabel(t, r)).join('، ')}
                    </p>
                  </div>
                  <div className="text-end">
                    <MatchPctBadge pct={m.matchPct as number} />
                    <p className="mt-1 text-xs font-bold text-text-primary">
                      {(product.price as number) ? `SAR ${product.price as number}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Hair Match */}
      <Card padding="md">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-text-primary">
          💇‍♀️ {t('beautyDna.hairMatch.title')}
        </h3>
        {(hair.missing as string[] | undefined)?.includes('faceShape') ? (
          <MissingHint>{t('beautyDna.missing.faceShape')}</MissingHint>
        ) : (
          <div className="space-y-2">
            {hairMatches.map((m) => {
              const style = (m.style ?? {}) as JsonRecord;
              return (
                <div
                  key={style.id as string}
                  className="flex items-center gap-3 rounded-xl bg-surface-elevated p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {pickName(style.nameJson, locale)}
                    </p>
                    <p className="line-clamp-2 text-xs text-text-secondary">
                      {pickName(style.descriptionJson, locale)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-text-tertiary">
                      {(m.reasons as string[]).map((r) => reasonLabel(t, r)).join('، ')}
                    </p>
                  </div>
                  <MatchPctBadge pct={m.matchPct as number} />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Fragrance Match */}
      <Card padding="md">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-text-primary">
          🌸 {t('beautyDna.fragranceMatch.title')}
        </h3>
        {(fragrance.missing as string[] | undefined)?.includes('preferredScents') ? (
          <MissingHint>{t('beautyDna.missing.preferredScents')}</MissingHint>
        ) : (
          <div className="space-y-2">
            {fragranceMatches.map((m) => {
              const product = (m.product ?? {}) as JsonRecord;
              const attrs = (product.attributes ?? {}) as JsonRecord;
              return (
                <div
                  key={product.id as number}
                  className="flex items-center gap-3 rounded-xl bg-surface-elevated p-3"
                >
                  <span className="text-lg">{product.emoji as string}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {pickName(product.nameJson, locale)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {t(
                        FAMILY_LABELS[attrs.fragranceFamily as string] ?? 'beautyDna.family.floral',
                      )}
                      {(attrs.seasons as string[] | undefined)?.length
                        ? ` · ${(attrs.seasons as string[])
                            .map((s) => t(`beautyDna.season.${s}` as TranslationKey))
                            .join(' / ')}`
                        : ''}
                    </p>
                    <p className="mt-0.5 text-[10px] text-text-tertiary">
                      {(m.reasons as string[]).map((r) => reasonLabel(t, r)).join('، ')}
                    </p>
                  </div>
                  <div className="text-end">
                    <MatchPctBadge pct={m.matchPct as number} />
                    <p className="mt-1 text-xs font-bold text-text-primary">
                      {(product.price as number) ? `SAR ${product.price as number}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
