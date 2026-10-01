// ---------------------------------------------------------------------------
// Galaxy of Beauty — Image Assets Configuration
// ---------------------------------------------------------------------------
// Centralised image registry. All images use Unsplash for development/
// staging. Replace with your own CDN URLs for production.
//
// Usage:
//   import { serviceImages, categoryImages } from '@galaxy/shared/images';
//   <Image src={serviceImages.hairStyling} alt="Hair Styling" width={400} height={300} />
// ---------------------------------------------------------------------------

const U = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format`;

// Stable placeholder CDN (picsum) for entries whose Unsplash id 404s.
const P = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

// ── Service Images ─────────────────────────────────────────

export const serviceImages: Record<string, string> = {
  // Hair
  hairStyling: U('photo-1560869713-7d0a29430803'),
  hairCut: U('photo-1560869713-7d0a29430803'),
  hairColor: U('photo-1522337360788-8b13dee7a37e'),
  hairTreatment: P('hairTreatment'),
  blowout: P('blowout'),
  braiding: P('braiding'),
  hairExtensions: P('hairExtensions'),
  keratinTreatment: U('photo-1560869713-7d0a29430803'),

  // Nails
  manicure: U('photo-1604654894610-df63bc536371'),
  pedicure: P('pedicure'),
  gelNails: P('gelNails'),
  nailArt: P('nailArt'),
  acrylicNails: P('acrylicNails'),

  // Skincare
  facial: P('facial'),
  deepCleansing: P('deepCleansing'),
  antiAging: P('antiAging'),
  microdermabrasion: P('microdermabrasion'),
  chemicalPeel: P('chemicalPeel'),
  hydraFacial: P('hydraFacial'),

  // Makeup
  makeup: U('photo-1487412947147-5cebf100ffc2'),
  bridalMakeup: P('bridalMakeup'),
  eveningMakeup: P('eveningMakeup'),
  airbrushMakeup: U('photo-1487412947147-5cebf100ffc2'),
  permanentMakeup: U('photo-1522337360788-8b13dee7a37e'),

  // Massage
  massage: U('photo-1544161515-4ab6ce6db874'),
  swedishMassage: U('photo-1544161515-4ab6ce6db874'),
  deepTissue: P('deepTissue'),
  hotStone: P('hotStone'),
  aromatherapy: P('aromatherapy'),
  moroccanBath: P('moroccanBath'),

  // Henna
  henna: P('henna'),
  bridalHenna: P('bridalHenna'),
  simpleHenna: P('simpleHenna'),

  // Waxing
  waxing: P('waxing'),
  sugaring: P('sugaring'),
  laserHairRemoval: P('laserHairRemoval'),

  // Lashes
  lashes: P('lashes'),
  lashExtensions: P('lashExtensions'),
  lashLift: P('lashLift'),

  // Body Treatments
  bodyScrub: P('bodyScrub'),
  bodyWrap: P('bodyWrap'),
  cellulite: P('cellulite'),

  // Spa
  spa: P('spa'),
  jacuzzi: P('jacuzzi'),
  sauna: P('sauna'),

  // Bridal
  bridalPackage: P('bridalPackage'),
  engagement: P('engagement'),

  // Default / Fallback
  beautyService: U('photo-1522337360788-8b13dee7a37e'),
  default: U('photo-1522337360788-8b13dee7a37e'),
};

// ── Category Images ────────────────────────────────────────

export const categoryImages: Record<string, string> = {
  hair: U('photo-1560869713-7d0a29430803'),
  nails: U('photo-1604654894610-df63bc536371'),
  skincare: P('skincare'),
  makeup: U('photo-1487412947147-5cebf100ffc2'),
  massage: U('photo-1544161515-4ab6ce6db874'),
  henna: P('henna'),
  waxing: P('waxing'),
  lashes: P('lashes'),
  bodyTreatments: P('bodyTreatments'),
  spa: P('spa'),
  bridal: P('bridal'),
  mensGrooming: P('mensGrooming'),
  default: U('photo-1522337360788-8b13dee7a37e'),
};

// ── Feature / Hero Images ──────────────────────────────────

export const heroImages = {
  main: U('photo-1560066984-138dadb4c035', 1200, 800),
  womenOnly: P('womenOnly'),
  booking: U('photo-1544161515-4ab6ce6db874', 800, 600),
  technicians: U('photo-1487412947147-5cebf100ffc2', 800, 600),
};

// ── Dashboard / Stats Images ───────────────────────────────

export const dashboardImages = {
  bookings: U('photo-1544161515-4ab6ce6db874', 400, 300),
  wallet: P('wallet'),
  profile: P('profile'),
  notifications: P('notifications'),
  reviews: P('reviews'),
  loyalty: P('loyalty'),
};

// ── Helper ─────────────────────────────────────────────────

/** Resolve an image URL from a key, with fallback. */
export function getServiceImage(key?: string | null): string {
  if (key && serviceImages[key]) return serviceImages[key]!;
  return serviceImages['default']!;
}

export function getCategoryImage(key?: string | null): string {
  if (key && categoryImages[key]) return categoryImages[key]!;
  return categoryImages['default']!;
}

/**
 * §3.5 — map a womens-services catalog category key (pregnancy_safe, nails,
 * bridal_glow, …) onto a registry key by theme. The 94-key catalog predates
 * the image registry and carries no imageUrl — theme rules + a generic
 * beauty fallback keep every card honest.
 */
const WOMENS_THEME_RULES: Array<{ pattern: RegExp; key: string }> = [
  { pattern: /bridal|bride/i, key: 'bridalPackage' },
  { pattern: /nail|manicure|pedicure/i, key: 'manicure' },
  { pattern: /laser/i, key: 'laserHairRemoval' },
  { pattern: /hair/i, key: 'hairStyling' },
  { pattern: /skin|facial|glow|complexion/i, key: 'facial' },
  { pattern: /lash/i, key: 'lashes' },
  { pattern: /wax/i, key: 'waxing' },
  { pattern: /massage/i, key: 'massage' },
  { pattern: /spa|hammam|moroccan|bath/i, key: 'spa' },
  { pattern: /makeup|make-up/i, key: 'makeup' },
  { pattern: /henna/i, key: 'henna' },
  { pattern: /body|scrub/i, key: 'bodyScrub' },
  { pattern: /laser/i, key: 'laserHairRemoval' },
  { pattern: /aroma/i, key: 'aromatherapy' },
];

export function womensCategoryImageKey(categoryKey?: string | null): string {
  if (!categoryKey) return 'beautyService';
  for (const rule of WOMENS_THEME_RULES) {
    if (rule.pattern.test(categoryKey)) return rule.key;
  }
  return 'beautyService';
}

/**
 * Map a category slug to a service-image registry key (the registry is keyed
 * by service key, not slug). Shared by home categories, discover tiles, and
 * the service-detail hero/related cards — one source of truth.
 */
export function serviceKeyFromCategorySlug(slug?: string | null): string {
  const map: Record<string, string> = {
    hair: 'hair',
    nails: 'nails',
    skincare: 'skincare',
    makeup: 'makeup',
    massage: 'massage',
    henna: 'henna',
    waxing: 'waxing',
    lashes: 'lashes',
    body: 'bodyTreatments',
    spa: 'spa',
    bridal: 'bridal',
    men: 'mensGrooming',
  };
  return (slug && map[slug]) || 'default';
}

/**
 * §3.5 hero-emoji sweep — map a (public) marketing page slug onto a shared
 * image-registry key for the page header (ServiceImage replaces the old
 * emoji glyph). Thematic pages get a matching photo; everything else falls
 * back to the generic beauty shot.
 */
const PAGE_HERO_KEYS: Record<string, string> = {
  'bridal-concierge': 'bridalPackage',
  'shop-the-look': 'makeup',
  'look-of-the-day': 'makeup',
  'behind-scenes': 'makeup',
  'beauty-shorts': 'makeup',
  'live-stream': 'makeup',
  tutorials: 'makeup',
  'video-testimonials': 'makeup',
  'featured-tech': 'makeup',
  'beauty-quiz': 'facial',
  'ingredient-analyzer': 'facial',
  'ingredient-sub': 'facial',
  'before-after': 'facial',
  'mommy-and-me': 'facial',
  'pregnancy-beauty': 'facial',
  'booking-heatmap': 'massage',
  'group-buy': 'spa',
  'surprise-me': 'spa',
  'audio-rooms': 'spa',
};

export function pageHeroKey(slug?: string | null): string {
  if (!slug) return 'beautyService';
  return PAGE_HERO_KEYS[slug] ?? 'beautyService';
}
