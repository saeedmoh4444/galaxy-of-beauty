'use client';
/**
 * E6a — life-stage journeys + period pampering on the wellness hub:
 * a stage card (auto-derived with manual override chips) and a pamper card
 * that activates when the predicted period is ≤ 3 days away.
 */
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type StageDef = {
  key: string;
  emoji: string;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
};

function pick(text: { ar: string; en: string }, locale: string): string {
  return locale === 'en' ? text.en : text.ar;
}

export function LifeStageCard(): JSX.Element {
  const { t, locale } = useLocale();
  const stageQ = api.lifeStage.get.useQuery();
  const chooseMut = api.lifeStage.choose.useMutation({ onSuccess: () => stageQ.refetch() });

  const d = stageQ.data as
    { stage: string; source: string; definition: StageDef; stages: StageDef[] } | undefined;
  if (!d) return <></>;

  return (
    <Card padding="lg" className="border-2 border-brand-100 dark:border-brand-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold">{t('lifeStage.title')}</h3>
          <p className="mt-1 text-2xl font-extrabold">
            {d.definition.emoji}{' '}
            {pick({ ar: d.definition.nameAr, en: d.definition.nameEn }, locale)}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {pick({ ar: d.definition.taglineAr, en: d.definition.taglineEn }, locale)}
          </p>
          {d.source === 'auto' && (
            <p className="mt-1 text-[10px] text-text-tertiary">{t('lifeStage.autoHint')}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {d.stages.map((s) => (
          <button
            key={s.key}
            onClick={() => chooseMut.mutate({ stage: s.key as never })}
            disabled={chooseMut.isPending}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              d.stage === s.key ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary'
            }`}
          >
            {s.emoji} {pick({ ar: s.nameAr, en: s.nameEn }, locale)}
          </button>
        ))}
      </div>
    </Card>
  );
}

export function PamperCard(): JSX.Element {
  const { t, locale } = useLocale();
  const statusQ = api.lifeStage.pamperStatus.useQuery();
  const d = statusQ.data as
    | {
        isPamperWindow: boolean;
        daysUntilNext: number | null;
        deals: Array<Record<string, unknown>>;
        kits: Array<Record<string, unknown>>;
        spaServices: Array<Record<string, unknown>>;
      }
    | undefined;

  if (!d) return <></>;

  return (
    <Card
      padding="lg"
      className={
        d.isPamperWindow
          ? 'border-2 border-pink-200 bg-pink-50/60 dark:border-pink-900 dark:bg-pink-950/30'
          : ''
      }
    >
      <h3 className="font-bold">{t('lifeStage.pamper.title')}</h3>
      {!d.isPamperWindow ? (
        <p className="mt-1 text-xs text-text-secondary">
          {d.daysUntilNext != null
            ? t('lifeStage.pamper.dormant', { days: d.daysUntilNext })
            : t('lifeStage.pamper.noCycle')}
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm font-semibold text-pink-700 dark:text-pink-300">
            {t('lifeStage.pamper.active')}
          </p>
          {d.deals.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-text-secondary">{t('lifeStage.pamper.deals')}</p>
              <div className="mt-1 space-y-1">
                {d.deals.map((deal) => (
                  <p key={deal.id as number} className="text-sm">
                    {locale === 'en' ? (deal.titleEn as string) : (deal.titleAr as string)} ·{' '}
                    <span className="font-bold text-brand-600">
                      {Number(deal.dealPrice)} {t('beautyParty.currency')}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          )}
          {d.kits.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-text-secondary">{t('lifeStage.pamper.kits')}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {d.kits.map((p) => (
                  <Link key={p.id as number} href="/stores">
                    <span className="rounded-full bg-surface-muted px-3 py-1 text-xs">
                      {(p.emoji as string) || '🧴'}{' '}
                      {locale === 'en'
                        ? ((p.nameJson as Record<string, string>)?.en ?? '')
                        : ((p.nameJson as Record<string, string>)?.ar ?? '')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {d.spaServices.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-text-secondary">{t('lifeStage.pamper.spa')}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {d.spaServices.map((s) => (
                  <Link key={s.id as number} href="/search">
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs text-pink-700">
                      {locale === 'en'
                        ? ((s.titleJson as Record<string, string>)?.en ?? '')
                        : ((s.titleJson as Record<string, string>)?.ar ?? '')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
