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

/** E6b — postpartum hub section, shown only for the new_mom stage. */
export function PostpartumSection(): JSX.Element {
  const { t, locale } = useLocale();
  const stageQ = api.lifeStage.get.useQuery();
  const stage = (stageQ.data as { stage: string } | undefined)?.stage;
  const isNewMom = stage === 'new_mom';

  const libQ = api.postpartum.library.useQuery(undefined, { enabled: isNewMom });
  const servicesQ = api.postpartum.services.useQuery(undefined, { enabled: isNewMom });
  const salonsQ = api.postpartum.babyFriendlySalons.useQuery({}, { enabled: isNewMom });

  const lib = libQ.data as
    | {
        phases: Array<Record<string, string>>;
        tips: Array<Record<string, string>>;
        signals: Array<Record<string, string>>;
      }
    | undefined;
  const services = (servicesQ.data ?? []) as Array<Record<string, any>>;
  const salons = (salonsQ.data ?? []) as Array<Record<string, any>>;

  if (!isNewMom || !lib) return <></>;

  return (
    <Card padding="lg" className="border-2 border-rose-100 dark:border-rose-900">
      <h3 className="font-bold">{t('postpartum.title')}</h3>
      <p className="mt-1 text-xs text-text-secondary">{t('postpartum.subtitle')}</p>
      <div className="mt-3 space-y-4">
        {lib.phases.map((p) => (
          <details key={p.key} className="rounded-xl bg-surface-muted p-3">
            <summary className="cursor-pointer text-sm font-bold">
              {p.emoji} {p[locale === 'en' ? 'rangeEn' : 'rangeAr']} ·{' '}
              {p[locale === 'en' ? 'titleEn' : 'titleAr']}
            </summary>
            <p className="mt-2 text-xs text-text-secondary">
              {p[locale === 'en' ? 'bodyEn' : 'bodyAr']}
            </p>
          </details>
        ))}
        <div className="flex flex-wrap gap-2">
          {lib.tips.map((tip, i) => (
            <span key={i} className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700">
              {tip.emoji} {tip[locale === 'en' ? 'en' : 'ar']}
            </span>
          ))}
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-xs font-bold text-amber-700">{t('postpartum.signalsTitle')}</p>
          <ul className="mt-1 space-y-1 text-xs text-amber-800 dark:text-amber-300">
            {lib.signals.map((s, i) => (
              <li key={i}>
                {s.emoji} {s[locale === 'en' ? 'en' : 'ar']}
              </li>
            ))}
          </ul>
        </div>
        {services.length > 0 && (
          <div>
            <p className="text-xs font-bold text-text-secondary">{t('postpartum.services')}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {services.map((s) => (
                <Link key={s.id} href="/search">
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs">
                    {locale === 'en'
                      ? ((s.titleJson as Record<string, string>)?.en ?? '')
                      : ((s.titleJson as Record<string, string>)?.ar ?? '')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {salons.length > 0 && (
          <div>
            <p className="text-xs font-bold text-text-secondary">
              {t('postpartum.babyFriendlySalons')}
            </p>
            <div className="mt-1 space-y-1">
              {salons.map((v) => (
                <p key={v.id} className="text-xs text-text-secondary">
                  🏠 {v.storeName} · {v.homeCity}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/** E6c — menopause mode card, shown only while the mode is enabled. */
export function MenopauseCard(): JSX.Element {
  const { t, locale } = useLocale();
  const statusQ = api.menopause.status.useQuery();
  const enabled = (statusQ.data as { enabled: boolean } | undefined)?.enabled ?? false;

  const libQ = api.menopause.library.useQuery(undefined, { enabled });
  const historyQ = api.menopause.history.useQuery({}, { enabled });
  const clinicsQ = api.menopause.clinics.useQuery(undefined, { enabled });
  const logMut = api.menopause.logSymptom.useMutation({ onSuccess: () => historyQ.refetch() });

  const lib = libQ.data as
    | {
        phases: Array<Record<string, string>>;
        tips: Array<Record<string, string>>;
        signals: Array<Record<string, string>>;
        symptoms: Array<Record<string, string>>;
      }
    | undefined;
  const history = (historyQ.data ?? []) as Array<Record<string, any>>;
  const clinics = (clinicsQ.data ?? []) as Array<Record<string, any>>;

  if (!enabled || !lib) return <></>;

  return (
    <Card padding="lg" className="border-2 border-brand-100 dark:border-brand-900">
      <h3 className="font-bold">🌗 {t('menopause.title')}</h3>
      <p className="mt-1 text-xs text-text-secondary">{t('menopause.subtitle')}</p>
      <div className="mt-3 space-y-4">
        {lib.phases.map((p) => (
          <details key={p.key} className="rounded-xl bg-surface-muted p-3">
            <summary className="cursor-pointer text-sm font-bold">
              {p.emoji} {p[locale === 'en' ? 'titleEn' : 'titleAr']}
            </summary>
            <p className="mt-2 text-xs text-text-secondary">
              {p[locale === 'en' ? 'bodyEn' : 'bodyAr']}
            </p>
          </details>
        ))}
        <div className="flex flex-wrap gap-2">
          {lib.tips.map((tip, i) => (
            <span key={i} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
              {tip.emoji} {tip[locale === 'en' ? 'en' : 'ar']}
            </span>
          ))}
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-xs font-bold text-amber-700">{t('menopause.signalsTitle')}</p>
          <ul className="mt-1 space-y-1 text-xs text-amber-800 dark:text-amber-300">
            {lib.signals.map((s, i) => (
              <li key={i}>
                {s.emoji} {s[locale === 'en' ? 'en' : 'ar']}
              </li>
            ))}
          </ul>
        </div>
        {/* Symptom log */}
        <div>
          <p className="text-xs font-bold text-text-secondary">{t('menopause.logTitle')}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {lib.symptoms.map((s) => (
              <button
                key={s.slug}
                disabled={logMut.isPending}
                onClick={() => logMut.mutate({ symptom: s.slug as never, severity: 2 })}
                className="rounded-full bg-surface-muted px-3 py-1 text-xs text-text-secondary disabled:opacity-50"
              >
                {s.emoji} {s[locale === 'en' ? 'en' : 'ar']} +
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <p className="mt-2 text-[11px] text-text-tertiary">
              {t('menopause.logged', { count: history.length })}
            </p>
          )}
        </div>
        {clinics.length > 0 && (
          <div>
            <p className="text-xs font-bold text-text-secondary">{t('menopause.clinics')}</p>
            <div className="mt-1 space-y-1">
              {clinics.map((v) => (
                <Link key={v.id} href={`/clinics/${v.storeSlug}`}>
                  <p className="text-xs text-brand-600 underline">{v.storeName}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
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
