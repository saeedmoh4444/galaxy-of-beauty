import { Card } from '@galaxy/ui';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function TermsPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t('marketing.terms.title', locale)}</h1>
      <Card padding="lg">
        <div className="space-y-4 text-sm leading-relaxed text-text-primary">
          <section>
            <h2 className="font-bold text-lg mb-2">
              {t('marketing.terms.section-1-title', locale)}
            </h2>
            <p>{t('marketing.terms.section-1-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">
              {t('marketing.terms.section-2-title', locale)}
            </h2>
            <p>{t('marketing.terms.section-2-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">
              {t('marketing.terms.section-3-title', locale)}
            </h2>
            <p>{t('marketing.terms.section-3-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">
              {t('marketing.terms.section-4-title', locale)}
            </h2>
            <p>{t('marketing.terms.section-4-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">
              {t('marketing.terms.section-5-title', locale)}
            </h2>
            <p>{t('marketing.terms.section-5-body', locale)}</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">
              {t('marketing.terms.section-6-title', locale)}
            </h2>
            <p>{t('marketing.terms.section-6-body', locale)}</p>
          </section>
        </div>
      </Card>
    </div>
  );
}
