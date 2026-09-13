import type { MetadataRoute } from 'next';
import { DEFAULT_APP_URL } from '@galaxy/shared';

const BASE_URL = process.env['NEXT_PUBLIC_APP_URL'] || DEFAULT_APP_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    // Core pages
    { url: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/services', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/technicians', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/marketplace', priority: 0.7, changeFrequency: 'daily' as const },
    { url: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },

    // Discovery
    { url: '/discover', priority: 0.7, changeFrequency: 'daily' as const },
    { url: '/search', priority: 0.6, changeFrequency: 'daily' as const },
    { url: '/trending', priority: 0.5, changeFrequency: 'daily' as const },

    // Commerce
    { url: '/beauty-packages', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/bundles', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/flash-deals', priority: 0.7, changeFrequency: 'daily' as const },
    { url: '/subscription-boxes', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/gift-cards', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/gift-guide', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/group-buy', priority: 0.5, changeFrequency: 'daily' as const },

    // Content
    { url: '/events', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/campaigns', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/tutorials', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/beauty-courses', priority: 0.5, changeFrequency: 'weekly' as const },
    { url: '/beauty-faq', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/lookbook', priority: 0.5, changeFrequency: 'weekly' as const },
    { url: '/before-after', priority: 0.5, changeFrequency: 'weekly' as const },

    // Interactive
    { url: '/compare', priority: 0.5, changeFrequency: 'weekly' as const },
    { url: '/services/surprise-me', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/beauty-quiz', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/onboarding', priority: 0.4, changeFrequency: 'monthly' as const },
    { url: '/virtual-consultation', priority: 0.5, changeFrequency: 'weekly' as const },
    { url: '/price-estimator', priority: 0.5, changeFrequency: 'weekly' as const },
    { url: '/skin-analysis', priority: 0.6, changeFrequency: 'weekly' as const },

    // Social
    { url: '/community', priority: 0.5, changeFrequency: 'daily' as const },
    { url: '/challenges', priority: 0.4, changeFrequency: 'weekly' as const },
    { url: '/referral-race', priority: 0.4, changeFrequency: 'weekly' as const },
    { url: '/technician-qa', priority: 0.4, changeFrequency: 'weekly' as const },

    // Specialized
    { url: '/salon-finder', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/salon-map', priority: 0.5, changeFrequency: 'weekly' as const },
    { url: '/womens-services', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/kids-services', priority: 0.5, changeFrequency: 'weekly' as const },
    { url: '/bridal-concierge', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/mommy-and-me', priority: 0.4, changeFrequency: 'weekly' as const },
    { url: '/corporate-wellness', priority: 0.4, changeFrequency: 'monthly' as const },

    // Auth
    { url: '/login', priority: 0.3, changeFrequency: 'monthly' as const },
    { url: '/register', priority: 0.3, changeFrequency: 'monthly' as const },
  ];

  return pages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
