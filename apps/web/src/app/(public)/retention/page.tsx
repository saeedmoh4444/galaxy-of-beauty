import type { JSX } from 'react';
import { Card } from '@galaxy/ui';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

/** 6.2 PDPL — data retention policy (Arabic-first, plain language). */
export default async function RetentionPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t('marketing.retention.title', locale)}</h1>
      <p className="text-sm leading-relaxed text-text-secondary">
        {t('marketing.retention.intro', locale)}
      </p>
      <Card padding="lg">
        <div className="space-y-4 text-sm leading-relaxed text-text-primary">
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.retention.s1-title', locale)}</h2>
            <p>{t('marketing.retention.s1-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.retention.s2-title', locale)}</h2>
            <p>{t('marketing.retention.s2-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.retention.s3-title', locale)}</h2>
            <p>{t('marketing.retention.s3-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.retention.s4-title', locale)}</h2>
            <p>{t('marketing.retention.s4-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">{t('marketing.retention.s5-title', locale)}</h2>
            <p>{t('marketing.retention.s5-body', locale)}</p>
          </section>
        </div>
      </Card>
    </div>
  );
}
