import type { MetadataRoute } from 'next';

/**
 * Women-only privacy (audit stage 12): the default robots.txt allowed
 * crawling everything. Crawlers get the public marketing surface only —
 * account, admin, technician, and API paths are disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://galaxyofbeauty.sa';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/customer',
          '/tech',
          '/api',
          '/dashboard',
          '/checkout',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
