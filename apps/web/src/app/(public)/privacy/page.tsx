import type { JSX } from 'react';
import { Card } from '@galaxy/ui';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

/** 6.2 PDPL — privacy policy (Arabic-first, plain language). */
export default async function PrivacyPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t('marketing.privacy.title', locale)}</h1>
      <p className="text-sm leading-relaxed text-text-secondary">
        {t('marketing.privacy.intro', locale)}
      </p>
      <Card padding="lg">
        <div className="space-y-4 text-sm leading-relaxed text-text-primary">
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.privacy.s1-title', locale)}</h2>
            <p>{t('marketing.privacy.s1-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.privacy.s2-title', locale)}</h2>
            <p>{t('marketing.privacy.s2-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.privacy.s3-title', locale)}</h2>
            <p>{t('marketing.privacy.s3-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.privacy.s4-title', locale)}</h2>
            <p>{t('marketing.privacy.s4-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.privacy.s5-title', locale)}</h2>
            <p>{t('marketing.privacy.s5-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.privacy.s6-title', locale)}</h2>
            <p>{t('marketing.privacy.s6-body', locale)}</p>
          </section>
        </div>
      </Card>
    </div>
  );
}
