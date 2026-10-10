import type { Metadata } from 'next';
import type { Locale } from '@galaxy/shared';

const SITE_NAME = 'Galaxy of Beauty';

/**
 * Q6 — per-page SEO metadata builder (locale-aware). Pages pass the
 * bilingual title/description + their path; the active locale picks the
 * strings. The site switches locale via cookie (no URL prefix), so
 * hreflang alternates are out of scope until URL-based locales land —
 * only the canonical is emitted.
 */
export function pageMeta(opts: {
  locale: Locale;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  path: string;
  imagePath?: string;
  noIndex?: boolean;
}): Metadata {
  const title = opts.locale === 'en' ? opts.titleEn : opts.titleAr;
  const description = opts.locale === 'en' ? opts.descriptionEn : opts.descriptionAr;
  const base = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000';
  const url = `${base}${opts.path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: opts.locale === 'en' ? 'en_US' : 'ar_SA',
      type: 'website',
      ...(opts.imagePath ? { images: [opts.imagePath] } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: opts.noIndex ? { index: false, follow: true } : undefined,
  };
}
