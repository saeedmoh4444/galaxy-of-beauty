import type { MetadataRoute } from 'next';

const BASE_URL = process.env['NEXT_PUBLIC_APP_URL'] || 'https://galaxyofbeauty.sa';

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = [
    { url: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/services', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/technicians', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/marketplace', priority: 0.7, changeFrequency: 'daily' as const },
    { url: '/beauty-packages', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/campaigns', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/subscription-boxes', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/compare', priority: 0.5, changeFrequency: 'weekly' as const },
    { url: '/services/surprise-me', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/login', priority: 0.3, changeFrequency: 'monthly' as const },
    { url: '/register', priority: 0.3, changeFrequency: 'monthly' as const },
  ];

  return publicPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
