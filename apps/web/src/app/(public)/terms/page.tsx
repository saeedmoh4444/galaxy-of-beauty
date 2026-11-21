import type { JSX } from 'react';
import Link from 'next/link';
import { Card } from '@galaxy/ui';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

const SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.terms.title', 'ar'),
    titleEn: t('marketing.terms.title', 'en'),
    descriptionAr: t('seo.page-description', 'ar'),
    descriptionEn: t('seo.page-description', 'en'),
    path: '/terms',
  });
}

export default async function TermsPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t('marketing.terms.title', locale)}</h1>
      <Card padding="lg">
        <div className="space-y-4 text-sm leading-relaxed text-text-primary">
          {SECTIONS.map((n) => (
            <section key={n}>
              <h2 className="font-bold text-lg mb-2">
                {t(`marketing.terms.section-${n}-title`, locale)}
              </h2>
              <p>{t(`marketing.terms.section-${n}-body`, locale)}</p>
            </section>
          ))}
          <p className="pt-2 text-text-secondary">
            <Link href="/refunds" className="text-brand-600 underline">
              {t('marketing.refunds.title', locale)}
            </Link>
            {' · '}
            <Link href="/privacy" className="text-brand-600 underline">
              {t('marketing.privacy.title', locale)}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
