import type { MetadataRoute } from 'next';
import { DEFAULT_APP_URL } from '@galaxy/shared';

const BASE_URL = process.env['NEXT_PUBLIC_APP_URL'] || DEFAULT_APP_URL;

type SitemapEntry = {
  url: string;
  priority: number;
  changeFrequency: 'daily' | 'weekly' | 'monthly';
};

// W6-1 — the static manifest now covers every public static route (was 32
// of 76). Dynamic detail pages (services/[id], technicians/[id], blog/[slug],
// stores/[slug], …) are excluded until build-time DB-backed generation lands
// (their content is reachable from the list pages, which are here).
const PAGES: SitemapEntry[] = [
  // Core
  { url: '/', priority: 1.0, changeFrequency: 'daily' },
  { url: '/services', priority: 0.9, changeFrequency: 'daily' },
  { url: '/technicians', priority: 0.8, changeFrequency: 'daily' },
  { url: '/stores', priority: 0.8, changeFrequency: 'daily' },
  { url: '/blog', priority: 0.7, changeFrequency: 'weekly' },

  // Discovery
  { url: '/discover', priority: 0.7, changeFrequency: 'daily' },
  { url: '/search', priority: 0.4, changeFrequency: 'daily' },
  { url: '/trending', priority: 0.7, changeFrequency: 'daily' },
  { url: '/featured-tech', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/tech-leaderboard', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/technician-badges', priority: 0.4, changeFrequency: 'monthly' },
  { url: '/technician-compare', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/technician-qa', priority: 0.4, changeFrequency: 'weekly' },

  // Commerce
  { url: '/beauty-packages', priority: 0.8, changeFrequency: 'weekly' },
  { url: '/flash-deals', priority: 0.8, changeFrequency: 'daily' },
  { url: '/subscription-boxes', priority: 0.7, changeFrequency: 'weekly' },
  { url: '/gift-guide', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/group-buy', priority: 0.6, changeFrequency: 'daily' },
  { url: '/shop-the-look', priority: 0.5, changeFrequency: 'weekly' },
  { url: '/look-of-the-day', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/bundles/custom', priority: 0.4, changeFrequency: 'weekly' },

  // Content
  { url: '/events', priority: 0.7, changeFrequency: 'weekly' },
  { url: '/event-tickets', priority: 0.5, changeFrequency: 'weekly' },
  { url: '/campaigns', priority: 0.7, changeFrequency: 'weekly' },
  { url: '/tutorials', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/beauty-faq', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/lookbook', priority: 0.5, changeFrequency: 'weekly' },
  { url: '/before-after', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/behind-scenes', priority: 0.4, changeFrequency: 'monthly' },
  { url: '/beauty-podcast', priority: 0.5, changeFrequency: 'weekly' },
  { url: '/beauty-shorts', priority: 0.5, changeFrequency: 'weekly' },
  { url: '/beauty-stories', priority: 0.5, changeFrequency: 'weekly' },
  { url: '/beauty-posts', priority: 0.5, changeFrequency: 'weekly' },
  { url: '/beauty-awards', priority: 0.4, changeFrequency: 'monthly' },
  { url: '/beauty-expo', priority: 0.4, changeFrequency: 'monthly' },
  { url: '/live-stream', priority: 0.5, changeFrequency: 'daily' },
  { url: '/video-testimonials', priority: 0.4, changeFrequency: 'monthly' },
  { url: '/beauty-stats', priority: 0.4, changeFrequency: 'monthly' },

  // Interactive tools
  { url: '/compare', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/product-compare', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/services/surprise-me', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/beauty-quiz', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/gift-quiz', priority: 0.4, changeFrequency: 'monthly' },
  { url: '/beauty-fortune', priority: 0.4, changeFrequency: 'monthly' },
  { url: '/onboarding', priority: 0.4, changeFrequency: 'monthly' },
  { url: '/price-estimator', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/smart-pricing', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/ingredient-analyzer', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/ingredient-sub', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/service-matchmaker', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/service-recommender', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/service-trends', priority: 0.4, changeFrequency: 'daily' },
  { url: '/booking-heatmap', priority: 0.4, changeFrequency: 'daily' },
  { url: '/tech-calendar', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/whatsapp-bot', priority: 0.4, changeFrequency: 'monthly' },
  { url: '/api-docs', priority: 0.3, changeFrequency: 'monthly' },

  // Social
  { url: '/referral-race', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/audio-rooms', priority: 0.5, changeFrequency: 'daily' },

  // Specialized
  { url: '/salon-finder', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/salon-map', priority: 0.5, changeFrequency: 'weekly' },
  { url: '/womens-services', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/kids-services', priority: 0.5, changeFrequency: 'weekly' },
  { url: '/pregnancy-beauty', priority: 0.5, changeFrequency: 'weekly' },
  { url: '/bridal-concierge', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/mommy-and-me', priority: 0.4, changeFrequency: 'weekly' },
  { url: '/clinics', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/gyms', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/nail-bars', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/barberettes', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/trainers', priority: 0.5, changeFrequency: 'weekly' },

  // Legal
  { url: '/privacy', priority: 0.3, changeFrequency: 'monthly' },
  { url: '/terms', priority: 0.3, changeFrequency: 'monthly' },
  { url: '/retention', priority: 0.3, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
