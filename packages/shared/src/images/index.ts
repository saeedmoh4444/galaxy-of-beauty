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

// ── Service Images ─────────────────────────────────────────

export const serviceImages: Record<string, string> = {
  // Hair
  hairStyling: U('photo-1560869713-7d0a29430803'),
  hairCut: U('photo-1560869713-7d0a29430803'),
  hairColor: U('photo-1522337360788-8b13dee7a37e'),
  hairTreatment: U('photo-1605980776566-2046c2c7cf3f'),
  blowout: U('photo-1600948836101-f9656532621b'),
  braiding: U('photo-1605493624805-3b62e5a9d1a5'),
  hairExtensions: U('photo-1582095133175-bf0e3e4b3df3'),
  keratinTreatment: U('photo-1560869713-7d0a29430803'),

  // Nails
  manicure: U('photo-1604654894610-df63bc536371'),
  pedicure: U('photo-1604654894611-df63bc536371'),
  gelNails: U('photo-1604654894612-df63bc536372'),
  nailArt: U('photo-1604654894613-df63bc536373'),
  acrylicNails: U('photo-1604654894614-df63bc536374'),

  // Skincare
  facial: U('photo-1570171269640-d3570a20e69b'),
  deepCleansing: U('photo-1570171269641-d3570a20e69c'),
  antiAging: U('photo-1570171269642-d3570a20e69d'),
  microdermabrasion: U('photo-1570171269643-d3570a20e69e'),
  chemicalPeel: U('photo-1570171269644-d3570a20e69f'),
  hydraFacial: U('photo-1570171269645-d3570a20e6a0'),

  // Makeup
  makeup: U('photo-1487412947147-5cebf100ffc2'),
  bridalMakeup: U('photo-1508962914676-134521a54068'),
  eveningMakeup: U('photo-1512496019611-e68040000001'),
  airbrushMakeup: U('photo-1487412947147-5cebf100ffc2'),
  permanentMakeup: U('photo-1522337360788-8b13dee7a37e'),

  // Massage
  massage: U('photo-1544161515-4ab6ce6db874'),
  swedishMassage: U('photo-1544161515-4ab6ce6db874'),
  deepTissue: U('photo-1544161515-4ab6ce6db875'),
  hotStone: U('photo-1544161515-4ab6ce6db876'),
  aromatherapy: U('photo-1544161515-4ab6ce6db877'),
  moroccanBath: U('photo-1544161515-4ab6ce6db878'),

  // Henna
  henna: U('photo-1596815371327-34d09f187cf8'),
  bridalHenna: U('photo-1596815371327-34d09f187cf8'),
  simpleHenna: U('photo-1596815371328-34d09f187cf9'),

  // Waxing
  waxing: U('photo-1570171269646-d3570a20e6a1'),
  sugaring: U('photo-1570171269647-d3570a20e6a2'),
  laserHairRemoval: U('photo-1570171269648-d3570a20e6a3'),

  // Lashes
  lashes: U('photo-1583001931096-3e3e3e3e3e3e'),
  lashExtensions: U('photo-1583001931096-3e3e3e3e3e3e'),
  lashLift: U('photo-1583001931097-3e3e3e3e3e3f'),

  // Body Treatments
  bodyScrub: U('photo-1544161515-4ab6ce6db879'),
  bodyWrap: U('photo-1544161515-4ab6ce6db880'),
  cellulite: U('photo-1544161515-4ab6ce6db881'),

  // Spa
  spa: U('photo-1544161515-4ab6ce6db882'),
  jacuzzi: U('photo-1544161515-4ab6ce6db883'),
  sauna: U('photo-1544161515-4ab6ce6db884'),

  // Bridal
  bridalPackage: U('photo-1508962914676-134521a54068'),
  engagement: U('photo-1508962914677-134521a54069'),

  // Default / Fallback
  beautyService: U('photo-1522337360788-8b13dee7a37e'),
  default: U('photo-1522337360788-8b13dee7a37e'),
};

// ── Category Images ────────────────────────────────────────

export const categoryImages: Record<string, string> = {
  hair: U('photo-1560869713-7d0a29430803'),
  nails: U('photo-1604654894610-df63bc536371'),
  skincare: U('photo-1570171269640-d3570a20e69b'),
  makeup: U('photo-1487412947147-5cebf100ffc2'),
  massage: U('photo-1544161515-4ab6ce6db874'),
  henna: U('photo-1596815371327-34d09f187cf8'),
  waxing: U('photo-1570171269646-d3570a20e6a1'),
  lashes: U('photo-1583001931096-3e3e3e3e3e3e'),
  bodyTreatments: U('photo-1544161515-4ab6ce6db879'),
  spa: U('photo-1544161515-4ab6ce6db882'),
  bridal: U('photo-1508962914676-134521a54068'),
  mensGrooming: U('photo-1621605815971-fbc98c3de9b6'),
  default: U('photo-1522337360788-8b13dee7a37e'),
};

// ── Feature / Hero Images ──────────────────────────────────

export const heroImages = {
  main: U('photo-1560066984-138dadb4c035', 1200, 800),
  womenOnly: U('photo-1605980776566-2046c2c7cf3f', 800, 600),
  booking: U('photo-1544161515-4ab6ce6db874', 800, 600),
  technicians: U('photo-1487412947147-5cebf100ffc2', 800, 600),
};

// ── Dashboard / Stats Images ───────────────────────────────

export const dashboardImages = {
  bookings: U('photo-1544161515-4ab6ce6db874', 400, 300),
  wallet: U('photo-1554224155-6726b3ffc0d5', 400, 300),
  profile: U('photo-1596755389378-c31d0d1e8b7c', 400, 300),
  notifications: U('photo-1554224155-6726b3ffc0d5', 400, 300),
  reviews: U('photo-1596755389378-c31d0d1e8b7c', 400, 300),
  loyalty: U('photo-1554224155-6726b3ffc0d5', 400, 300),
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
